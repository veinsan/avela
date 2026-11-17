import sqlite3
from datetime import datetime, timedelta, timezone

from app.db import db_path, iso
from app.keys import create_key


def snapshot(retrieved_ago=timedelta(minutes=10)):
    t = datetime.now(timezone.utc)
    return {"provider": "open-meteo", "modelDomain": "cams_global", "retrievedAt": iso(t - retrieved_ago),
            "attributions": ["Open-Meteo", "CAMS"], "isSynthetic": True,
            "points": [{"validAt": iso(t + timedelta(hours=1)), "value": 50.0},  # future, not "current"
                       {"validAt": iso(t - timedelta(hours=1)), "value": 30.5},
                       {"validAt": iso(t - timedelta(hours=2)), "value": None}]}


def push(client, area, body, key=None):
    headers = {"X-API-Key": key} if key else {}
    return client.put(f"/api/v1/internal/areas/{area}/snapshot", json=body, headers=headers)


def test_areas_seeded_and_advisory_unavailable_without_snapshot(client):
    assert [a["id"] for a in client.get("/api/v1/areas").json()["items"]] == ["palangka-raya", "pekanbaru"]
    adv = client.get("/api/v1/areas/pekanbaru/advisory").json()
    assert adv["freshness"] == "unavailable" and adv["current"] is None and adv["series"] is None
    assert client.get("/api/v1/areas/jakarta/advisory").status_code == 404


def test_snapshot_push_requires_scoped_key(client):
    peer_key = create_key("peer-test", ["areas:read", "signal:read"])
    assert push(client, "pekanbaru", snapshot()).status_code == 401
    assert push(client, "pekanbaru", snapshot(), key="avk_wrong").status_code == 401
    r = push(client, "pekanbaru", snapshot(), key=peer_key)
    assert r.status_code == 403 and r.json()["error"]["code"] == "FORBIDDEN"
    assert client.get("/api/v1/areas/pekanbaru/advisory").json()["freshness"] == "unavailable"


def test_pushed_snapshot_feeds_advisory(client):
    key = create_key("integration", ["snapshots:write"])
    r = push(client, "pekanbaru", snapshot(), key=key)
    assert r.status_code == 201 and r.json()["points"] == 3
    adv = client.get("/api/v1/areas/pekanbaru/advisory").json()
    assert adv["freshness"] == "fresh" and adv["isSynthetic"] is True
    assert adv["current"]["value"] == 30.5  # latest past point with a value
    assert [p["validAt"] for p in adv["series"]] == sorted(p["validAt"] for p in adv["series"])
    assert 9 <= adv["ageMinutes"] <= 11
    # The other area is untouched; unknown area and bad payloads are rejected.
    assert client.get("/api/v1/areas/palangka-raya/advisory").json()["freshness"] == "unavailable"
    assert push(client, "jakarta", snapshot(), key=key).status_code == 404
    assert push(client, "pekanbaru", {**snapshot(), "points": []}, key=key).status_code == 422
    assert push(client, "pekanbaru", snapshot(retrieved_ago=-timedelta(hours=1)), key=key).status_code == 422


def test_old_snapshot_is_stale_and_keys_are_stored_hashed(client):
    key = create_key("integration", ["snapshots:write"])
    push(client, "palangka-raya", snapshot(retrieved_ago=timedelta(hours=3)), key=key)
    assert client.get("/api/v1/areas/palangka-raya/advisory").json()["freshness"] == "stale"
    stored = [r[0] for r in sqlite3.connect(db_path()).execute("SELECT key_hash FROM api_keys")]
    assert stored and key not in stored
