import uuid
from datetime import datetime, timedelta, timezone

from app.db import iso
from app.keys import create_key
from test_core import REPORT, submit


def hour(offset_hours: int) -> str:
    t = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    return iso(t + timedelta(hours=offset_hours))


def push_points(client, area, points):
    key = create_key(f"integration-{uuid.uuid4().hex[:8]}", ["snapshots:write"])
    body = {"provider": "open-meteo", "modelDomain": "cams_global", "retrievedAt": hour(0), "isSynthetic": True,
            "attributions": ["Open-Meteo", "CAMS"], "points": points}
    assert client.put(f"/api/v1/internal/areas/{area}/snapshot", json=body,
                      headers={"X-API-Key": key}).status_code == 201


def test_report_freezes_exposure_context(client, auth):  # T-26
    push_points(client, "pekanbaru", [
        {"validAt": hour(-6), "value": 99.0},   # before onset, left out
        {"validAt": hour(-3), "value": 20.0},   # the hour symptoms began
        {"validAt": hour(-2), "value": None},   # provider gap, left out
        {"validAt": hour(-1), "value": 50.0},
        {"validAt": hour(2), "value": 80.0},    # after submission, left out
    ])
    onset = iso(datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) - timedelta(hours=3)
                + timedelta(minutes=20))
    r = submit(client, auth("warga1"), body={**REPORT, "onsetAt": onset})
    assert r.status_code == 201
    ctx = r.json()["exposureContext"]
    assert ctx["windowStart"] == hour(-3) and ctx["points"] == 2
    assert ctx["meanPm25"] == 35.0 and ctx["peakPm25"] == 50.0
    assert ctx["areaId"] == "pekanbaru" and ctx["dataKind"] == "model_forecast"
    assert r.json()["exposureContextReason"] is None

    # A later snapshot does not change a submitted report: the context is frozen.
    push_points(client, "pekanbaru", [{"validAt": hour(-1), "value": 400.0}])
    detail = client.get(f"/api/v1/reports/{r.json()['id']}", headers=auth("petugas1")).json()
    assert detail["exposureContext"] == ctx


def test_report_without_snapshot_still_saves(client, auth):  # T-27
    r = submit(client, auth("warga1"), body={**REPORT, "areaId": "palangka-raya", "facilityId": "demo-facility-002",
                                              "onsetAt": hour(-1)})
    assert r.status_code == 201
    assert r.json()["exposureContext"] is None and r.json()["exposureContextReason"] == "no_snapshot"


def test_report_needs_a_known_area(client, auth):
    w1 = auth("warga1")
    missing = {k: v for k, v in REPORT.items() if k != "areaId"}
    assert submit(client, w1, body=missing).json()["error"]["message"] == "Invalid fields: areaId"
    assert submit(client, w1, body={**REPORT, "areaId": "jakarta"}).json()["error"]["code"] == "UNKNOWN_AREA"


def test_existing_database_gains_new_columns(tmp_path, monkeypatch):
    import sqlite3

    from app.db import init_db
    path = tmp_path / "old.db"
    monkeypatch.setenv("AVELA_DB_PATH", str(path))
    old = sqlite3.connect(path)  # the reports table as deployed before A-24
    old.execute("CREATE TABLE reports (id TEXT PRIMARY KEY, owner_id TEXT, facility_id TEXT, complaint TEXT,"
                " onset_at TEXT, course TEXT, additional_context TEXT, consent_version TEXT, state TEXT,"
                " version INTEGER, reviewer_id TEXT, idempotency_key TEXT, payload_hash TEXT, created_at TEXT,"
                " updated_at TEXT)")
    old.execute("INSERT INTO reports (id, complaint) VALUES ('r1', 'lama')")
    old.commit()
    old.close()
    init_db()
    init_db()  # a second start changes nothing
    row = sqlite3.connect(path).execute("SELECT complaint, area_id, exposure_context_reason FROM reports").fetchone()
    assert row == ("lama", None, None)
