from test_core import submit


def published_result(client, auth):
    w1, p1 = auth("warga1"), auth("petugas1")
    rid = submit(client, w1).json()["id"]
    client.post(f"/api/v1/staff/reports/{rid}/claim", json={"expectedVersion": 1}, headers=p1)
    client.post(f"/api/v1/staff/reports/{rid}/responses", headers=p1,
                json={"expectedVersion": 2, "text": "Datang ke puskesmas", "disposition": "onsite_assessment"})
    res = client.post("/api/v1/staff/results", json={"reportId": rid, "content": "Hasil fiktif versi satu"},
                      headers=p1).json()
    client.post(f"/api/v1/staff/results/{res['id']}/publish", headers=p1)
    return rid, res["id"]


def test_correction_is_a_new_version_and_the_old_one_stays_readable(client, auth):  # T-34
    w1, w2, p1, p2 = auth("warga1"), auth("warga2"), auth("petugas1"), auth("petugas2")
    rid, v1 = published_result(client, auth)
    fix = {"content": "Hasil fiktif versi dua"}

    assert client.post(f"/api/v1/staff/results/{v1}/corrections", json=fix, headers=p2).status_code == 404
    draft = client.post(f"/api/v1/staff/results/{v1}/corrections", json=fix, headers=p1)
    assert draft.status_code == 201
    v2 = draft.json()
    assert v2["version"] == 2 and v2["previousId"] == v1 and v2["status"] == "draft"
    # One open correction at a time, and a draft cannot be corrected.
    assert client.post(f"/api/v1/staff/results/{v1}/corrections", json=fix, headers=p1).status_code == 409
    assert client.post(f"/api/v1/staff/results/{v2['id']}/corrections", json=fix, headers=p1).status_code == 409

    # Until the correction is published, the owner still sees version 1 as the latest.
    assert [r["id"] for r in client.get("/api/v1/results", headers=w1).json()["items"]] == [v1]
    assert client.get(f"/api/v1/results/{v2['id']}", headers=w1).status_code == 404
    client.post(f"/api/v1/staff/results/{v2['id']}/publish", headers=p1)

    mine = client.get("/api/v1/results", headers=w1).json()["items"]
    assert [r["id"] for r in mine] == [v2["id"]]
    latest = client.get(f"/api/v1/results/{v2['id']}", headers=w1).json()
    assert [h["id"] for h in latest["history"]] == [v1] and latest["supersededBy"] is None
    old = client.get(f"/api/v1/results/{v1}", headers=w1).json()
    assert old["content"] == "Hasil fiktif versi satu" and old["supersededBy"] == v2["id"]
    assert client.get(f"/api/v1/results/{v2['id']}", headers=w2).status_code == 404

    listed = client.get(f"/api/v1/staff/results?reportId={rid}", headers=p1).json()["items"]
    assert [r["version"] for r in listed] == [1, 2]
    assert client.get(f"/api/v1/staff/results?reportId={rid}", headers=p2).json()["items"] == []
