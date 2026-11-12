"""Examination Result context: staff-authored onsite results linked to a resident's report."""
import sqlite3

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from .db import get_db, new_id, now
from .errors import ApiError, conflict, not_found
from .security import current_account, resident, staff

router = APIRouter()


class ResultIn(BaseModel):
    reportId: str = Field(min_length=1, max_length=64)
    content: str = Field(min_length=3, max_length=4000)


def result_out(db, row) -> dict:
    author = db.execute("SELECT display_name FROM accounts WHERE id = ?", (row["author_id"],)).fetchone()
    facility = db.execute("SELECT name FROM facilities WHERE id = ?", (row["facility_id"],)).fetchone()
    return {"id": row["id"], "reportId": row["report_id"], "status": row["status"], "content": row["content"],
            "authorName": author[0], "facilityId": row["facility_id"], "facilityName": facility[0],
            "createdAt": row["created_at"], "publishedAt": row["published_at"]}


@router.post("/staff/results", status_code=201)
def create_result(body: ResultIn, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    report = db.execute("SELECT * FROM reports WHERE id = ?", (body.reportId,)).fetchone()
    if report is None or report["facility_id"] not in me["facilities"]:
        raise not_found()
    if report["state"] not in ("responded", "closed"):
        raise ApiError(409, "REPORT_NOT_RESPONDED", "A result can only follow a published staff response.")
    # Linkage comes from the resident-owned report, never from a client-supplied owner ID.
    result_id = new_id()
    with db:
        db.execute("INSERT INTO results (id, owner_id, report_id, facility_id, author_id, content, status, created_at)"
                   " VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)",
                   (result_id, report["owner_id"], report["id"], report["facility_id"], me["id"], body.content, now()))
    return result_out(db, db.execute("SELECT * FROM results WHERE id = ?", (result_id,)).fetchone())


@router.post("/staff/results/{result_id}/publish")
def publish_result(result_id: str, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM results WHERE id = ?", (result_id,)).fetchone()
    if row is None or row["facility_id"] not in me["facilities"]:
        raise not_found()
    # shortcut: published results are final; add versioned corrections when the correction flow is designed.
    with db:
        cur = db.execute("UPDATE results SET status = 'published', published_at = ? WHERE id = ? AND status = 'draft'",
                         (now(), result_id))
        if cur.rowcount != 1:
            raise conflict()
    return result_out(db, db.execute("SELECT * FROM results WHERE id = ?", (result_id,)).fetchone())


@router.get("/results")
def my_results(me: dict = Depends(resident), db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM results WHERE owner_id = ? AND status = 'published' "
                      "ORDER BY published_at DESC", (me["id"],)).fetchall()
    return {"items": [result_out(db, r) for r in rows]}


@router.get("/results/{result_id}")
def get_result(result_id: str, me: dict = Depends(current_account), db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM results WHERE id = ?", (result_id,)).fetchone()
    if row is None:
        raise not_found()
    owner_can_see = row["owner_id"] == me["id"] and row["status"] == "published"
    staff_can_see = me["role"] == "staff" and row["facility_id"] in me["facilities"]
    if not (owner_can_see or staff_can_see):
        raise not_found()
    return result_out(db, row)
