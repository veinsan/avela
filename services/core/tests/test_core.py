REPORT = {
    "areaId": "pekanbaru",
    "facilityId": "demo-facility-001",
    "complaint": "Keluhan fiktif untuk pengujian",
    "onsetAt": "2026-11-10T03:00:00Z",
    "course": "unchanged",
    "consentVersion": "demo-v1",
}


def submit(client, headers, key="key-00000001", body=REPORT):
    return client.post("/api/v1/reports", json=body, headers={**headers, "Idempotency-Key": key})


def test_health_and_login(client, auth):
    assert client.get("/health").json() == {"status": "ok"}
    r = client.post("/api/v1/auth/login", json={"username": "warga1", "password": "wrong"})
    assert r.status_code == 401 and r.json()["error"]["code"] == "INVALID_CREDENTIALS"
    assert client.get("/api/v1/me").status_code == 401
    assert client.get("/api/v1/me", headers=auth("petugas1")).json()["facilities"] == ["demo-facility-001"]


def test_report_validation(client, auth):
    w1 = auth("warga1")
    bad = submit(client, w1, body={**REPORT, "course": "?", "complaint": ""})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "VALIDATION_FAILED"
    assert submit(client, w1, body={**REPORT, "facilityId": "nope"}).json()["error"]["code"] == "UNKNOWN_FACILITY"
    assert submit(client, w1, body={**REPORT, "onsetAt": "2999-01-01T00:00:00Z"}).status_code == 422
    assert submit(client, auth("petugas1")).status_code == 403  # staff cannot file resident reports


def test_retry_is_idempotent_and_conflicting_reuse_rejected(client, auth):  # T-06
    w1 = auth("warga1")
    first = submit(client, w1)
    again = submit(client, w1)
    assert first.status_code == 201 and again.status_code == 200
    assert first.json()["id"] == again.json()["id"]
    assert len(client.get("/api/v1/reports", headers=w1).json()["items"]) == 1
    clash = submit(client, w1, body={**REPORT, "complaint": "Isi berbeda"})
    assert clash.status_code == 409 and clash.json()["error"]["code"] == "IDEMPOTENCY_CONFLICT"


def test_resident_cannot_see_other_residents_data(client, auth):  # T-05, T-07
    w1, w2 = auth("warga1"), auth("warga2")
    rid = submit(client, w1).json()["id"]
    assert client.get(f"/api/v1/reports/{rid}", headers=w1).status_code == 200
    assert client.get(f"/api/v1/reports/{rid}", headers=w2).status_code == 404
    assert client.get("/api/v1/reports", headers=w2).json()["items"] == []
    r = client.post(f"/api/v1/reports/{rid}/cancel", json={"expectedVersion": 1}, headers=w2)
    assert r.status_code == 404


def test_staff_limited_to_own_facility(client, auth):  # T-08
    rid = submit(client, auth("warga1")).json()["id"]
    p2 = auth("petugas2")
    assert client.get(f"/api/v1/reports/{rid}", headers=p2).status_code == 404
    assert client.get("/api/v1/staff/reports", headers=p2).json()["items"] == []
    assert client.post(f"/api/v1/staff/reports/{rid}/claim", json={"expectedVersion": 1}, headers=p2).status_code == 404
    assert len(client.get("/api/v1/staff/reports", headers=auth("petugas1")).json()["items"]) == 1


def test_stale_version_loses(client, auth):  # T-09
    rid = submit(client, auth("warga1")).json()["id"]
    p1 = auth("petugas1")
    assert client.post(f"/api/v1/staff/reports/{rid}/claim", json={"expectedVersion": 1}, headers=p1).status_code == 200
    late = client.post(f"/api/v1/staff/reports/{rid}/claim", json={"expectedVersion": 1}, headers=p1)
    assert late.status_code == 409 and late.json()["error"]["code"] == "VERSION_CONFLICT"


def test_full_review_cycle_and_result_delivery(client, auth):  # T-10, T-11, T-12
    w1, w2, p1, p2 = auth("warga1"), auth("warga2"), auth("petugas1"), auth("petugas2")
    report = submit(client, w1).json()
    rid = report["id"]
    assert report["state"] == "submitted" and not report["reviewerAssigned"]

    v = client.post(f"/api/v1/staff/reports/{rid}/claim", json={"expectedVersion": 1}, headers=p1).json()["version"]
    v = client.post(f"/api/v1/staff/reports/{rid}/information-requests",
                    json={"expectedVersion": v, "text": "Sejak kapan batuk?"}, headers=p1).json()["version"]
    r = client.post(f"/api/v1/reports/{rid}/updates", json={"expectedVersion": v, "text": "Sejak kemarin"}, headers=w1)
    assert r.json()["state"] == "in_review"
    v = r.json()["version"]

    # The resident cannot respond as staff, and a result cannot precede a response.
    assert client.post(f"/api/v1/staff/reports/{rid}/responses", headers=w1,
                       json={"expectedVersion": v, "text": "x", "disposition": "self_care"}).status_code == 403
    assert client.post("/api/v1/staff/results", json={"reportId": rid, "content": "Hasil fiktif"},
                       headers=p1).status_code == 409

    r = client.post(f"/api/v1/staff/reports/{rid}/responses", headers=p1,
                    json={"expectedVersion": v, "text": "Datang ke puskesmas", "disposition": "onsite_assessment"})
    detail = r.json()
    assert detail["state"] == "responded"
    kinds = [(e["kind"], e["authorRole"]) for e in detail["events"]]
    assert kinds == [("submitted", "resident"), ("claimed", "staff"), ("information_request", "staff"),
                     ("resident_update", "resident"), ("staff_response", "staff")]

    res = client.post("/api/v1/staff/results", json={"reportId": rid, "content": "Hasil pemeriksaan fiktif"},
                      headers=p1).json()
    assert client.get(f"/api/v1/results/{res['id']}", headers=w1).status_code == 404  # draft hidden from resident
    assert client.post(f"/api/v1/staff/results/{res['id']}/publish", headers=p2).status_code == 404
    assert client.post(f"/api/v1/staff/results/{res['id']}/publish", headers=p1).json()["status"] == "published"
    assert client.post(f"/api/v1/staff/results/{res['id']}/publish", headers=p1).status_code == 409

    mine = client.get("/api/v1/results", headers=w1).json()["items"]
    assert [m["id"] for m in mine] == [res["id"]] and mine[0]["authorName"] == "Petugas Simulasi A"
    assert client.get(f"/api/v1/results/{res['id']}", headers=w2).status_code == 404
    assert client.get("/api/v1/results", headers=w2).json()["items"] == []


def test_cancel_only_before_review(client, auth):
    w1 = auth("warga1")
    rid = submit(client, w1).json()["id"]
    assert client.post(f"/api/v1/reports/{rid}/cancel", json={"expectedVersion": 1}, headers=w1).json()["state"] == "cancelled"
    rid2 = submit(client, w1, key="key-00000002").json()["id"]
    client.post(f"/api/v1/staff/reports/{rid2}/claim", json={"expectedVersion": 1}, headers=auth("petugas1"))
    assert client.post(f"/api/v1/reports/{rid2}/cancel", json={"expectedVersion": 2}, headers=w1).status_code == 409
