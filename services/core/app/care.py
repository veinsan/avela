"""Care Coordination context: symptom reports and staff review."""
import hashlib
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Header, Query
from fastapi.responses import JSONResponse
from pydantic import AwareDatetime, BaseModel, Field

from .db import get_db, iso, new_id, now
from .environment import exposure_context
from .errors import ApiError, conflict, not_found
from .security import current_account, resident, staff

router = APIRouter()

OPEN_FOR_RESIDENT_UPDATE = ("submitted", "in_review", "awaiting_information")


class ReportIn(BaseModel):
    areaId: str = Field(min_length=1, max_length=64)
    facilityId: str = Field(min_length=1, max_length=64)
    complaint: str = Field(min_length=3, max_length=2000)
    onsetAt: AwareDatetime
    course: Literal["better", "unchanged", "worse"]
    additionalContext: Optional[str] = Field(default=None, max_length=2000)
    consentVersion: str = Field(min_length=1, max_length=32)


class VersionIn(BaseModel):
    expectedVersion: int = Field(ge=1)


class TextIn(VersionIn):
    text: str = Field(min_length=1, max_length=2000)


class ResponseIn(TextIn):
    disposition: Literal["self_care", "remote_follow_up", "onsite_assessment"]


def report_out(db: sqlite3.Connection, row: sqlite3.Row, with_events: bool = False) -> dict:
    out = {
        "id": row["id"], "areaId": row["area_id"], "facilityId": row["facility_id"], "state": row["state"],
        "version": row["version"],
        "complaint": row["complaint"], "onsetAt": row["onset_at"], "course": row["course"],
        "additionalContext": row["additional_context"], "consentVersion": row["consent_version"],
        "reviewerAssigned": row["reviewer_id"] is not None,
        "exposureContext": json.loads(row["exposure_context"]) if row["exposure_context"] else None,
        "exposureContextReason": row["exposure_context_reason"],
        "createdAt": row["created_at"], "updatedAt": row["updated_at"],
    }
    if with_events:
        out["events"] = [
            {"id": e["id"], "kind": e["kind"], "text": e["text"], "disposition": e["disposition"],
             "authorName": e["display_name"], "authorRole": e["role"], "createdAt": e["created_at"]}
            for e in db.execute(
                "SELECT e.*, a.display_name, a.role FROM report_events e JOIN accounts a ON a.id = e.author_id "
                "WHERE e.report_id = ? ORDER BY e.created_at, e.rowid", (row["id"],))
        ]
    return out


def add_event(db, report_id, author_id, kind, text=None, disposition=None):
    db.execute("INSERT INTO report_events (id, report_id, author_id, kind, text, disposition, created_at) "
               "VALUES (?, ?, ?, ?, ?, ?, ?)", (new_id(), report_id, author_id, kind, text, disposition, now()))


def transition(db, report_id, expected, from_states, to_state, extra_where="", extra_params=()):
    """Version-checked state change; raises 409 when another actor got there first."""
    marks = ",".join("?" * len(from_states))
    cur = db.execute(
        f"UPDATE reports SET state = ?, version = version + 1, updated_at = ? "
        f"WHERE id = ? AND version = ? AND state IN ({marks}) {extra_where}",
        (to_state, now(), report_id, expected, *from_states, *extra_params))
    if cur.rowcount != 1:
        raise conflict()


def visible_report(db, report_id: str, account: dict) -> sqlite3.Row:
    row = db.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    if row is None:
        raise not_found()
    if row["owner_id"] == account["id"]:
        return row
    if account["role"] == "staff" and row["facility_id"] in account["facilities"]:
        return row
    raise not_found()


def reload(db, report_id):
    return db.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()


# ---------- Resident ----------

@router.post("/reports", status_code=201)
def create_report(body: ReportIn, idempotency_key: str = Header(min_length=8, max_length=100),
                  me: dict = Depends(resident), db: sqlite3.Connection = Depends(get_db)):
    submitted = datetime.now(timezone.utc)
    if body.onsetAt > submitted + timedelta(minutes=5):
        raise ApiError(422, "VALIDATION_FAILED", "Invalid fields: onsetAt")
    if db.execute("SELECT 1 FROM areas WHERE id = ?", (body.areaId,)).fetchone() is None:
        raise ApiError(422, "UNKNOWN_AREA", "The selected area is not available.")
    if db.execute("SELECT 1 FROM facilities WHERE id = ? AND area_id = ?",
                  (body.facilityId, body.areaId)).fetchone() is None:
        raise ApiError(422, "UNKNOWN_FACILITY", "The selected facility is not available in this area.")
    payload = body.model_dump(mode="json")
    payload_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

    existing = db.execute("SELECT * FROM reports WHERE owner_id = ? AND idempotency_key = ?",
                          (me["id"], idempotency_key)).fetchone()
    if existing is None:
        report_id, ts = new_id(), iso(submitted)
        context, reason = exposure_context(db, body.areaId, body.onsetAt, submitted)
        try:
            with db:  # report, frozen exposure context, and first event are one transaction
                db.execute(
                    "INSERT INTO reports (id, owner_id, area_id, facility_id, complaint, onset_at, course,"
                    " additional_context, consent_version, state, idempotency_key, payload_hash, exposure_context,"
                    " exposure_context_reason, created_at, updated_at)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?, ?, ?)",
                    (report_id, me["id"], body.areaId, body.facilityId, body.complaint, payload["onsetAt"],
                     body.course, body.additionalContext, body.consentVersion, idempotency_key, payload_hash,
                     json.dumps(context) if context else None, reason, ts, ts))
                add_event(db, report_id, me["id"], "submitted")
            return report_out(db, reload(db, report_id), with_events=True)
        except sqlite3.IntegrityError:  # concurrent retry with the same key won the insert
            existing = db.execute("SELECT * FROM reports WHERE owner_id = ? AND idempotency_key = ?",
                                  (me["id"], idempotency_key)).fetchone()
    if existing["payload_hash"] != payload_hash:
        raise ApiError(409, "IDEMPOTENCY_CONFLICT", "This idempotency key was already used for a different report.")
    return JSONResponse(report_out(db, existing, with_events=True), status_code=200)


@router.get("/reports")
def list_reports(limit: int = Query(20, ge=1, le=50), offset: int = Query(0, ge=0),
                 me: dict = Depends(resident), db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM reports WHERE owner_id = ? ORDER BY created_at DESC, rowid DESC "
                      "LIMIT ? OFFSET ?", (me["id"], limit, offset)).fetchall()
    return {"items": [report_out(db, r) for r in rows], "limit": limit, "offset": offset}


@router.get("/reports/{report_id}")
def get_report(report_id: str, me: dict = Depends(current_account), db: sqlite3.Connection = Depends(get_db)):
    return report_out(db, visible_report(db, report_id, me), with_events=True)


@router.post("/reports/{report_id}/updates")
def add_update(report_id: str, body: TextIn, me: dict = Depends(resident),
               db: sqlite3.Connection = Depends(get_db)):
    row = visible_report(db, report_id, me)
    # A reply to an information request hands the case back to the reviewer.
    target = "in_review" if row["state"] == "awaiting_information" else row["state"]
    with db:
        transition(db, report_id, body.expectedVersion, OPEN_FOR_RESIDENT_UPDATE, target,
                   "AND owner_id = ? AND state = ?", (me["id"], row["state"]))
        add_event(db, report_id, me["id"], "resident_update", body.text)
    return report_out(db, reload(db, report_id), with_events=True)


@router.post("/reports/{report_id}/cancel")
def cancel_report(report_id: str, body: VersionIn, me: dict = Depends(resident),
                  db: sqlite3.Connection = Depends(get_db)):
    visible_report(db, report_id, me)
    with db:
        transition(db, report_id, body.expectedVersion, ("submitted",), "cancelled", "AND owner_id = ?", (me["id"],))
        add_event(db, report_id, me["id"], "cancelled")
    return report_out(db, reload(db, report_id), with_events=True)


# ---------- Staff ----------

def staff_report(db, report_id: str, me: dict) -> sqlite3.Row:
    row = db.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    if row is None or row["facility_id"] not in me["facilities"]:
        raise not_found()
    return row


def require_reviewer(row, me):
    if row["reviewer_id"] != me["id"]:
        raise ApiError(403, "NOT_REVIEWER", "Only the staff member who claimed this report can do this.")


@router.get("/staff/reports")
def staff_queue(state: Optional[str] = None, limit: int = Query(20, ge=1, le=50), offset: int = Query(0, ge=0),
                me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    marks = ",".join("?" * len(me["facilities"]))
    sql = f"SELECT * FROM reports WHERE facility_id IN ({marks})"
    params = list(me["facilities"])
    if state:
        sql += " AND state = ?"
        params.append(state)
    rows = db.execute(sql + " ORDER BY created_at, rowid LIMIT ? OFFSET ?", (*params, limit, offset)).fetchall()
    return {"items": [report_out(db, r) for r in rows], "limit": limit, "offset": offset}


@router.post("/staff/reports/{report_id}/claim")
def claim(report_id: str, body: VersionIn, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    staff_report(db, report_id, me)
    with db:
        transition(db, report_id, body.expectedVersion, ("submitted",), "in_review")
        db.execute("UPDATE reports SET reviewer_id = ? WHERE id = ?", (me["id"], report_id))
        add_event(db, report_id, me["id"], "claimed")
    return report_out(db, reload(db, report_id), with_events=True)


@router.post("/staff/reports/{report_id}/information-requests")
def request_information(report_id: str, body: TextIn, me: dict = Depends(staff),
                        db: sqlite3.Connection = Depends(get_db)):
    require_reviewer(staff_report(db, report_id, me), me)
    with db:
        transition(db, report_id, body.expectedVersion, ("in_review",), "awaiting_information",
                   "AND reviewer_id = ?", (me["id"],))
        add_event(db, report_id, me["id"], "information_request", body.text)
    return report_out(db, reload(db, report_id), with_events=True)


@router.post("/staff/reports/{report_id}/responses")
def respond(report_id: str, body: ResponseIn, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    require_reviewer(staff_report(db, report_id, me), me)
    with db:  # response publication and state change are one transaction
        transition(db, report_id, body.expectedVersion, ("in_review",), "responded", "AND reviewer_id = ?", (me["id"],))
        add_event(db, report_id, me["id"], "staff_response", body.text, body.disposition)
    return report_out(db, reload(db, report_id), with_events=True)


@router.post("/staff/reports/{report_id}/close")
def close(report_id: str, body: VersionIn, me: dict = Depends(staff), db: sqlite3.Connection = Depends(get_db)):
    require_reviewer(staff_report(db, report_id, me), me)
    with db:
        transition(db, report_id, body.expectedVersion, ("responded",), "closed", "AND reviewer_id = ?", (me["id"],))
        add_event(db, report_id, me["id"], "closed")
    return report_out(db, reload(db, report_id), with_events=True)
