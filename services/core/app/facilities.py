"""Facility Directory context: Avela's simulated facilities with services and opening schedule (D-24)."""
import json
import sqlite3
from typing import Optional

from fastapi import APIRouter, Depends

from .db import get_db
from .errors import not_found

router = APIRouter()


def facility_out(row: sqlite3.Row) -> dict:
    # A day's hours are "HH:MM-HH:MM", "closed", or null for unknown; a null schedule means nothing is known.
    return {"id": row["id"], "name": row["name"], "areaId": row["area_id"], "areaName": row["area_name"],
            "services": json.loads(row["services"]) if row["services"] else [],
            "schedule": json.loads(row["schedule"]) if row["schedule"] else None,
            "isSimulated": True}


SELECT = "SELECT f.*, a.name AS area_name FROM facilities f LEFT JOIN areas a ON a.id = f.area_id"


@router.get("/facilities")
def list_facilities(areaId: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    sql, params = (SELECT + " WHERE f.area_id = ?", (areaId,)) if areaId else (SELECT, ())
    return {"items": [facility_out(r) for r in db.execute(sql + " ORDER BY f.name", params)]}


@router.get("/facilities/{facility_id}")
def get_facility(facility_id: str, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute(SELECT + " WHERE f.id = ?", (facility_id,)).fetchone()
    if row is None:
        raise not_found()
    return facility_out(row)
