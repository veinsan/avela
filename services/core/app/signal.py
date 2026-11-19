"""Area Health Signal context: anonymous report counts per area and day, with small counts hidden."""
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from .db import get_db
from .errors import not_found
from .security import require_scope

router = APIRouter()

SUPPRESS_BELOW = 5  # counts from 1 to 4 are hidden (D-30); zero stays zero
WIB = timedelta(hours=7)  # days are calendar days in Western Indonesia Time
SYNTHETIC = True  # every account and case in the coursework is fictional (D-11)


def shown(count: int) -> Optional[int]:
    return None if 0 < count < SUPPRESS_BELOW else count


def counts_since(db: sqlite3.Connection, area_id: str, days: int) -> tuple[list[str], dict, dict]:
    """Days in the window, report counts per day, and response counts per disposition. Cancelled reports are left out."""
    today = (datetime.now(timezone.utc) + WIB).date()
    dates = [(today - timedelta(days=n)).isoformat() for n in range(days - 1, -1, -1)]
    where = "r.area_id = ? AND r.state != 'cancelled' AND date(r.created_at, '+7 hours') >= ?"
    daily = dict(db.execute(f"SELECT date(r.created_at, '+7 hours') AS day, COUNT(*) FROM reports r WHERE {where}"
                            " GROUP BY day", (area_id, dates[0])).fetchall())
    dispositions = dict(db.execute(
        "SELECT e.disposition, COUNT(*) FROM reports r JOIN report_events e ON e.report_id = r.id"
        f" AND e.kind = 'staff_response' WHERE {where} GROUP BY e.disposition", (area_id, dates[0])).fetchall())
    return dates, daily, dispositions


def community_signal(db: sqlite3.Connection, area_id: str, days: int = 7) -> dict:
    _, daily, _ = counts_since(db, area_id, days)
    count = shown(sum(daily.values()))
    return {"days": days, "reportCount": count, "suppressed": count is None}


@router.get("/public/areas/{area_id}/health-signal")
def health_signal(area_id: str, days: int = Query(7, ge=1, le=30), _key: dict = Depends(require_scope("signal:read")),
                  db: sqlite3.Connection = Depends(get_db)):
    if db.execute("SELECT 1 FROM areas WHERE id = ?", (area_id,)).fetchone() is None:
        raise not_found()
    dates, daily, dispositions = counts_since(db, area_id, days)
    return {
        "areaId": area_id, "days": days,
        "daily": [{"date": d, "reportCount": shown(daily.get(d, 0)), "suppressed": shown(daily.get(d, 0)) is None}
                  for d in dates],
        "dispositions": {k: shown(dispositions.get(k, 0)) for k in ("self_care", "remote_follow_up",
                                                                     "onsite_assessment")},
        "suppressionRule": "Counts from 1 to 4 are hidden.",
        "isSynthetic": SYNTHETIC,
    }
