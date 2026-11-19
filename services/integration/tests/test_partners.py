import pytest
from fastapi.testclient import TestClient

from app import flowganic, partners, upstream, veriqu
from app.main import app


@pytest.fixture(autouse=True)
def clean(monkeypatch):
    partners.CACHE.clear()
    for name in ("VERIQU_BASE_URL", "FLOWGANIC_BASE_URL", "FLOWGANIC_AREA_CODES", "AVELA_SNAPSHOT_KEY"):
        monkeypatch.delenv(name, raising=False)


def live(monkeypatch, name, answer):
    """Point an adapter at a live URL whose single response is `answer` (a body or an exception)."""
    monkeypatch.setenv(f"{name}_BASE_URL", f"https://{name.lower()}.test")

    def fake(url, method="GET", headers=None, body=None):
        if isinstance(answer, Exception):
            raise answer
        return answer
    monkeypatch.setattr(upstream, "request_json", fake)


def test_mock_mode_is_labelled_and_keeps_only_protective_products():
    out = TestClient(app).get("/guidance/products").json()
    assert out["source"] == "Veriqu" and out["isMock"] is True and out["freshness"] == "fresh"
    assert [p["category"] for p in out["data"]] == ["masker", "masker", "pembersih-udara"]
    assert out["data"][0]["ratingSummary"] == {"average": 4.6, "count": 128}


def test_live_veriqu_is_translated_and_not_labelled_mock(monkeypatch):
    live(monkeypatch, "VERIQU", {"items": [{"id": 7, "name": "N95", "category": "masker",
                                            "rating": {"average": "4.5", "count": "10"}, "url": "https://x"}]})
    out = veriqu.products()
    assert out["isMock"] is False and out["data"] == [{"id": "7", "name": "N95", "category": "masker",
                                                       "ratingSummary": {"average": 4.5, "count": 10},
                                                       "link": "https://x"}]


@pytest.mark.parametrize("failure", [upstream.UpstreamError("TimeoutError"), upstream.UpstreamError("HTTP 429"),
                                     {"products": []}, {"items": [{"id": 1, "category": "masker"}]}])
def test_veriqu_failure_serves_last_good_answer_as_stale_or_unavailable(monkeypatch, failure):  # T-15, T-23
    live(monkeypatch, "VERIQU", failure)
    assert veriqu.products()["freshness"] == "unavailable" and veriqu.products()["data"] is None
    live(monkeypatch, "VERIQU", {"items": [{"id": 1, "name": "N95", "category": "masker",
                                            "rating": {"average": 4, "count": 1}}]})
    good = veriqu.products()
    live(monkeypatch, "VERIQU", failure)
    stale = veriqu.products()
    assert stale["freshness"] == "stale" and stale["data"] == good["data"]
    assert stale["retrievedAt"] == good["retrievedAt"]


def test_waste_recap_maps_codes_and_drops_unmapped_ones():  # T-35
    out = TestClient(app).get("/areas/pekanbaru/waste").json()
    assert out["source"] == "FlowGanic" and out["isMock"] is True
    assert out["data"] == {"areaId": "pekanbaru", "period": "2026-11",
                           "items": [{"wasteType": "anorganik", "volumeKg": 185.2},
                                     {"wasteType": "organik", "volumeKg": 730.5}]}
    assert 999.0 not in [i["volumeKg"] for i in flowganic.waste("palangka-raya")["data"]["items"]]


def test_waste_for_an_area_without_agreed_codes_is_unavailable(monkeypatch):
    monkeypatch.setenv("FLOWGANIC_AREA_CODES", '{"pekanbaru": ["14.71"]}')
    assert flowganic.waste("palangka-raya")["freshness"] == "unavailable"
    live(monkeypatch, "FLOWGANIC", {"items": [{"areaCode": "14.71", "wasteType": "organik",
                                               "managedVolumeKg": 5, "period": "2026-11"},
                                              {"areaCode": "99.99", "wasteType": "organik",
                                               "managedVolumeKg": 50, "period": "2026-11"}]})
    out = flowganic.waste("pekanbaru")
    assert out["isMock"] is False and out["data"]["items"] == [{"wasteType": "organik", "volumeKg": 5.0}]


def test_health_reports_push_off_without_a_key():
    assert TestClient(app).get("/health").json()["snapshotPush"] == "off"
