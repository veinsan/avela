from test_core import REPORT, submit


def test_directory_lists_facilities_by_area(client):  # T-25 (API)
    everything = client.get("/api/v1/facilities").json()["items"]
    assert {f["id"] for f in everything} == {"demo-facility-001", "demo-facility-002"}
    pekanbaru = client.get("/api/v1/facilities?areaId=pekanbaru").json()["items"]
    assert [f["id"] for f in pekanbaru] == ["demo-facility-001"]
    f = pekanbaru[0]
    assert f["areaName"] == "Pekanbaru" and f["isSimulated"] is True and "Nebulisasi" in f["services"]
    assert f["schedule"][6] == {"day": "sun", "hours": "closed"}
    assert client.get("/api/v1/facilities?areaId=jakarta").json()["items"] == []


def test_unknown_hours_stay_unknown(client):  # T-25 (API)
    f = client.get("/api/v1/facilities/demo-facility-002").json()
    assert f["schedule"][5] == {"day": "sat", "hours": None}  # unknown, not closed
    assert client.get("/api/v1/facilities/nope").status_code == 404


def test_report_facility_must_be_in_the_chosen_area(client, auth):
    r = submit(client, auth("warga1"), body={**REPORT, "areaId": "palangka-raya"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "UNKNOWN_FACILITY"


def test_seed_upgrades_facilities_created_before_the_directory(client):
    import sqlite3

    from app.db import db_path
    from app.seed import seed
    conn = sqlite3.connect(db_path())
    conn.execute("UPDATE facilities SET area_id = NULL, services = NULL, schedule = NULL")
    conn.commit()
    seed("test-password-only")
    assert client.get("/api/v1/facilities/demo-facility-001").json()["areaId"] == "pekanbaru"
