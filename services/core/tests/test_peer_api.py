import uuid
from datetime import datetime, timedelta, timezone

from app.db import iso
from app.keys import create_key
from test_core import submit


def peer_key(scopes=("areas:read", "signal:read", "guidance:read"), label="peer-group"):
    return {"X-API-Key": create_key(label, list(scopes))}


def test_public_endpoints_need_a_scoped_key(client):  # T-30
    paths = {"/api/v1/public/areas": "areas:read", "/api/v1/public/areas/pekanbaru/advisory": "areas:read",
             "/api/v1/public/areas/pekanbaru/health-signal": "signal:read", "/api/v1/public/guidance": "guidance:read"}
    full, narrow = peer_key(), peer_key(scopes=("snapshots:write",), label="integration")
    for path in paths:
        assert client.get(path).status_code == 401
        assert client.get(path, headers={"X-API-Key": "avk_unknown"}).status_code == 401
        assert client.get(path, headers=narrow).json()["error"]["code"] == "FORBIDDEN"
        assert client.get(path, headers=full).status_code == 200
    assert client.get("/api/v1/public/areas/jakarta/health-signal", headers=full).status_code == 404
    assert client.get("/api/v1/public/areas/pekanbaru/health-signal?days=31", headers=full).status_code == 422


def test_health_signal_hides_small_counts_and_cancelled_reports(client, auth):  # T-29
    w1, p1, key = auth("warga1"), auth("petugas1"), peer_key()
    ids = [submit(client, w1, key=f"key-signal-{n:04d}").json()["id"] for n in range(6)]
    client.post(f"/api/v1/reports/{ids[0]}/cancel", json={"expectedVersion": 1}, headers=w1)
    for rid in ids[1:3]:  # two responses: a count below 5, so hidden
        client.post(f"/api/v1/staff/reports/{rid}/claim", json={"expectedVersion": 1}, headers=p1)
        client.post(f"/api/v1/staff/reports/{rid}/responses", headers=p1,
                    json={"expectedVersion": 2, "text": "Pantau di rumah", "disposition": "self_care"})

    body = client.get("/api/v1/public/areas/pekanbaru/health-signal?days=3", headers=key).json()
    today = body["daily"][-1]
    assert len(body["daily"]) == 3 and today == {"date": today["date"], "reportCount": 5, "suppressed": False}
    assert body["daily"][0]["reportCount"] == 0 and not body["daily"][0]["suppressed"]  # zero stays zero
    assert body["dispositions"] == {"self_care": None, "remote_follow_up": 0, "onsite_assessment": 0}
    assert body["isSynthetic"] is True
    text = str(body)
    assert "Keluhan fiktif" not in text and "warga" not in text and "demo-facility" not in text

    client.post(f"/api/v1/reports/{ids[1]}/cancel", json={"expectedVersion": 1}, headers=w1)  # claimed: refused
    client.post(f"/api/v1/reports/{ids[3]}/cancel", json={"expectedVersion": 1}, headers=w1)
    body = client.get("/api/v1/public/areas/pekanbaru/health-signal?days=3", headers=key).json()
    assert body["daily"][-1] == {"date": today["date"], "reportCount": None, "suppressed": True}

    signal = client.get("/api/v1/areas/pekanbaru/advisory").json()["communitySignal"]
    assert signal == {"days": 7, "reportCount": None, "suppressed": True}
    other = client.get("/api/v1/areas/palangka-raya/advisory").json()["communitySignal"]
    assert other == {"days": 7, "reportCount": 0, "suppressed": False}


def push_hours(client, values):
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    points = [{"validAt": iso(now - timedelta(hours=n)), "value": v} for n, v in enumerate(values)]
    body = {"provider": "open-meteo", "retrievedAt": iso(now), "points": points}
    key = create_key(f"integration-{uuid.uuid4().hex[:8]}", ["snapshots:write"])
    assert client.put("/api/v1/internal/areas/pekanbaru/snapshot", json=body,
                      headers={"X-API-Key": key}).status_code == 201
    return client.get("/api/v1/areas/pekanbaru/advisory").json()["category"]


def test_category_uses_the_24_hour_mean_and_ispu_bands(client):
    assert push_hours(client, [20.0] * 17)["label"] is None  # too few hours for a 24-hour mean
    category = push_hours(client, [10.0] * 12 + [70.0] * 12)  # mean 40.0
    assert category["label"] == "Sedang" and category["mean24h"] == 40.0
    assert category["standard"].startswith("ISPU reference")
    assert push_hours(client, [15.5] * 24)["label"] == "Baik"  # a band includes its upper bound
    assert push_hours(client, [300.0] * 24)["label"] == "Berbahaya"


def test_guidance_names_sources_and_review_status(client):
    body = client.get("/api/v1/guidance").json()
    assert body["items"] and all(i["source"]["url"].startswith("https://") and i["reviewStatus"] == "unreviewed"
                                 for i in body["items"])
    assert [c["number"] for c in body["emergency"]["contacts"]] == ["119", "112"]


def test_peer_test_account_has_its_own_password(client):
    from app.seed import seed
    seed("test-password-only", "peer-only-password")
    login = lambda u, p: client.post("/api/v1/auth/login", json={"username": u, "password": p}).status_code
    assert login("uji-mitra", "peer-only-password") == 200
    assert login("uji-mitra", "test-password-only") == 401
    assert login("warga1", "peer-only-password") == 401
