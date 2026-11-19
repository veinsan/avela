"""Examination Result context: staff-authored onsite results linked to a resident's report.

A published result is never edited. A correction is a new version that points to the one it corrects (D-26), and the
owner keeps reading every published version."""
import sqlite3

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from .db import get_db, new_id, now
from .errors import ApiError, conflict, not_found
from .security import current_account, resident, staff

router = APIRouter()


class ContentIn(BaseModel):
    content: str = Field(min_length=3, max_length=4000)


class ResultIn(ContentIn):
    reportId: str = Field(min_length=1, max_length=64)


def result_out(db, row, with_history: bool = False) -> dict:
    author = db.execute("SELECT display_name FROM accounts WHERE id = ?", (row["author_id"],)).fetchone()
    facility = db.execute("SELECT name FROM facilities WHERE id = ?", (row["facility_id"],)).fetchone()
    newer = db.execute("SELECT id FROM results WHERE previous_id = ? AND status = 'published'", (row["id"],)).fetchone()
    out = {"id": row["id"], "reportId": row["report_id"], "status": row["status"], "content": row["content"],
           "version": row["version"], "previousId": row["previous_id"], "supersededBy": newer[0] if newer else None,
           "authorName": author[0], "facilityId": row["facility_id"], "facilityName": facility[0],
           "createdAt": row["created_at"], "publishedAt": row["published_at"]}
    if with_history:  # earlier versions, newest first; every one of them was published before it was corrected
        out["history"], prev = [], row["previous_id"]
        while prev:
            old = db.execute("SELECT * FROM results WHERE id = ?", (prev,)).fetchone()
            out["history"].append(result_out(db, old))
            prev = old["previous_id"]
    return out


def load(db, result_id: str) -> sqlite3.Row:
    return db.execute("SELECT * FROM results WHERE id = ?", (result_id,)).fetchone()


def staff_result(db, result_id: str, me: dict) -> sqlite3.Row:
    row = load(db, result_id)
    if row is None or row["facility_id"] not in me["facilities"]:
        raise not_found()
    return row


@router.post("/staff/results", status_code=201)
def create_result(body: ResultIn, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    report = db.execute("SELECT * FROM reports WHERE id = ?", (body.reportId,)).fetchone()
    if report is None or report["facility_id"] not in me["facilities"]:
        raise not_found()
    if report["state"] not in ("responded", "closed"):
        raise ApiError(409, "REPORT_NOT_RESPONDED", "A result can only follow a published staff response.")
    # Linkage comes from the resident-owned report, never from a client-supplied owner ID (D-32).
    result_id = new_id()
    with db:
        db.execute("INSERT INTO results (id, owner_id, report_id, facility_id, author_id, content, status, created_at)"
                   " VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)",
                   (result_id, report["owner_id"], report["id"], report["facility_id"], me["id"], body.content, now()))
    return result_out(db, load(db, result_id))


@router.post("/staff/results/{result_id}/corrections", status_code=201)
def correct_result(result_id: str, body: ContentIn, me: dict = Depends(staff),
                   db: sqlite3.Connection = Depends(get_db)):
    old = staff_result(db, result_id, me)
    correction_id = new_id()
    with db:
        # Only the latest published version can be corrected, and only one correction can be open at a time.
        cur = db.execute(
            "INSERT INTO results (id, owner_id, report_id, facility_id, author_id, content, status, created_at,"
            " version, previous_id) SELECT ?, owner_id, report_id, facility_id, ?, ?, 'draft', ?, version + 1, id"
            " FROM results WHERE id = ? AND status = 'published'"
            " AND NOT EXISTS (SELECT 1 FROM results WHERE previous_id = ?)",
            (correction_id, me["id"], body.content, now(), old["id"], old["id"]))
        if cur.rowcount != 1:
            raise conflict()
    return result_out(db, load(db, correction_id), with_history=True)


@router.post("/staff/results/{result_id}/publish")
def publish_result(result_id: str, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    staff_result(db, result_id, me)
    with db:
        cur = db.execute("UPDATE results SET status = 'published', published_at = ? WHERE id = ? AND status = 'draft'",
                         (now(), result_id))
        if cur.rowcount != 1:
            raise conflict()
    return result_out(db, load(db, result_id), with_history=True)


@router.get("/staff/results")
def facility_results(reportId: str, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM results WHERE report_id = ? ORDER BY version, created_at", (reportId,)).fetchall()
    return {"items": [result_out(db, r) for r in rows if r["facility_id"] in me["facilities"]]}


@router.get("/results")
def my_results(me: dict = Depends(resident), db: sqlite3.Connection = Depends(get_db)):
    # The latest published version of each result; earlier versions are in its history.
    rows = db.execute("SELECT * FROM results r WHERE owner_id = ? AND status = 'published' AND NOT EXISTS"
                      " (SELECT 1 FROM results n WHERE n.previous_id = r.id AND n.status = 'published')"
                      " ORDER BY published_at DESC", (me["id"],)).fetchall()
    return {"items": [result_out(db, r) for r in rows]}


@router.get("/results/{result_id}")
def get_result(result_id: str, me: dict = Depends(current_account), db: sqlite3.Connection = Depends(get_db)):
    row = load(db, result_id)
    if row is None:
        raise not_found()
    owner_can_see = row["owner_id"] == me["id"] and row["status"] == "published"
    staff_can_see = me["role"] == "staff" and row["facility_id"] in me["facilities"]
    if not (owner_can_see or staff_can_see):
        raise not_found()
    return result_out(db, row, with_history=True)
