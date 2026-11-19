"""Environment context: pilot areas, pushed PM2.5 snapshots, and the smoke advisory."""
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal, Optional

from fastapi import APIRouter, Depends
from pydantic import AwareDatetime, BaseModel, Field

from .db import get_db, iso, new_id, now
from .errors import ApiError, not_found
from .security import require_scope

router = APIRouter()

# Data-age threshold, an engineering choice (DATA_SOURCES), not a health rule.
STALE_AFTER = timedelta(hours=2)
EXPOSURE_WINDOW = timedelta(hours=48)


class PointIn(BaseModel):
    validAt: AwareDatetime
    value: Optional[float] = Field(default=None, ge=0, le=2000)  # provider gaps stay null


class SnapshotIn(BaseModel):
    provider: str = Field(min_length=1, max_length=64)
    modelDomain: Optional[str] = Field(default=None, max_length=64)
    dataKind: Literal["model_forecast"] = "model_forecast"
    unit: Literal["ug/m3"] = "ug/m3"
    retrievedAt: AwareDatetime
    attributions: list[Annotated[str, Field(min_length=1, max_length=64)]] = Field(default_factory=list,
                                                                                   max_length=5)
    isSynthetic: bool = False
    points: list[PointIn] = Field(min_length=1, max_length=240)


def area_out(row: sqlite3.Row) -> dict:
    return {"id": row["id"], "name": row["name"], "province": row["province"],
            "latitude": row["latitude"], "longitude": row["longitude"]}


def get_area(db: sqlite3.Connection, area_id: str) -> sqlite3.Row:
    row = db.execute("SELECT * FROM areas WHERE id = ?", (area_id,)).fetchone()
    if row is None:
        raise not_found()
    return row


def latest_snapshot(db: sqlite3.Connection, area_id: str) -> Optional[sqlite3.Row]:
    return db.execute("SELECT * FROM area_snapshots WHERE area_id = ? ORDER BY retrieved_at DESC, rowid DESC",
                      (area_id,)).fetchone()


def exposure_context(db: sqlite3.Connection, area_id: str, onset: datetime,
                     submitted: datetime) -> tuple[Optional[dict], Optional[str]]:
    """Mean and peak forecast PM2.5 for the area from symptom onset to submission (US-10, D-16).

    An area value, never a personal dose. Returns (None, reason) when no forecast point covers the window."""
    # The window starts at the hour the symptoms began, capped at the last 48 hours.
    start = max(onset, submitted - EXPOSURE_WINDOW).astimezone(timezone.utc).replace(minute=0, second=0,
                                                                                    microsecond=0)
    snap = latest_snapshot(db, area_id)
    lo, hi = iso(start), iso(submitted)
    values = [p["value"] for p in json.loads(snap["points"]) if lo <= p["validAt"] <= hi
              and p["value"] is not None] if snap else []
    if not values:
        return None, "no_snapshot"
    return {"areaId": area_id, "windowStart": lo, "windowEnd": hi,
            "meanPm25": round(sum(values) / len(values), 1), "peakPm25": max(values), "points": len(values),
            "unit": snap["unit"], "provider": snap["provider"], "dataKind": snap["data_kind"],
            "retrievedAt": snap["retrieved_at"]}, None


def advisory_out(db: sqlite3.Connection, area: sqlite3.Row) -> dict:
    snap = latest_snapshot(db, area["id"])
    out = {"areaId": area["id"], "areaName": area["name"], "pollutant": "pm2_5", "unit": "ug/m3",
           "dataKind": None, "provider": None, "modelDomain": None, "retrievedAt": None, "ageMinutes": None,
           "freshness": "unavailable", "current": None, "category": None, "series": None,
           # shortcut: community signal needs reports.area_id, added with the health signal (A-25)
           "communitySignal": None,
           "attributions": [], "isSynthetic": False}
    if snap is None:
        return out
    age = datetime.now(timezone.utc) - datetime.fromisoformat(snap["retrieved_at"])
    series = json.loads(snap["points"])
    cutoff = now()  # points are stored as normalised UTC strings, so string order is time order
    past = [p for p in series if p["validAt"] <= cutoff and p["value"] is not None]
    out.update({
        "dataKind": snap["data_kind"], "provider": snap["provider"], "modelDomain": snap["model_domain"],
        "retrievedAt": snap["retrieved_at"], "ageMinutes": max(0, int(age.total_seconds() // 60)),
        "freshness": "fresh" if age <= STALE_AFTER else "stale",
        "current": past[-1] if past else None,
        # Label stays null until the ISPU breakpoints are sourced (Q-13).
        "category": {"standard": "ISPU reference", "label": None},
        "series": series, "attributions": json.loads(snap["attributions"]),
        "isSynthetic": bool(snap["is_synthetic"]),
    })
    return out


@router.get("/areas")
def list_areas(db: sqlite3.Connection = Depends(get_db)):
    return {"items": [area_out(r) for r in db.execute("SELECT * FROM areas ORDER BY name")]}


@router.get("/areas/{area_id}/advisory")
def get_advisory(area_id: str, db: sqlite3.Connection = Depends(get_db)):
    return advisory_out(db, get_area(db, area_id))


@router.put("/internal/areas/{area_id}/snapshot", status_code=201)
def push_snapshot(area_id: str, body: SnapshotIn, key: dict = Depends(require_scope("snapshots:write")),
                  db: sqlite3.Connection = Depends(get_db)):
    get_area(db, area_id)
    if body.retrievedAt > datetime.now(timezone.utc) + timedelta(minutes=5):
        raise ApiError(422, "VALIDATION_FAILED", "Invalid fields: retrievedAt")
    points = sorted(({"validAt": iso(p.validAt), "value": p.value} for p in body.points),
                    key=lambda p: p["validAt"])
    snapshot_id, pushed_at = new_id(), now()
    with db:
        db.execute("INSERT INTO area_snapshots (id, area_id, provider, model_domain, data_kind, unit, attributions,"
                   " is_synthetic, points, retrieved_at, pushed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (snapshot_id, area_id, body.provider, body.modelDomain, body.dataKind, body.unit,
                    json.dumps(body.attributions), int(body.isSynthetic), json.dumps(points),
                    iso(body.retrievedAt), pushed_at))
    return {"snapshotId": snapshot_id, "areaId": area_id, "retrievedAt": iso(body.retrievedAt),
            "pushedAt": pushed_at, "points": len(points)}
