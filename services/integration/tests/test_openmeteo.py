import pytest

from app import openmeteo, upstream


def provider_body(times=("2026-11-20T00:00", "2026-11-20T01:00"), values=(41.25, None), unit="μg/m³"):
    return {"hourly": {"time": list(times), "pm2_5": list(values)}, "hourly_units": {"pm2_5": unit}}


def stub(monkeypatch, provider, pushes):
    def fake(url, method="GET", headers=None, body=None):
        if "open-meteo" in url:
            if isinstance(provider, Exception):
                raise provider
            return provider
        pushes.append((url, headers, body))
        return {"snapshotId": "s1"}
    monkeypatch.setattr(upstream, "request_json", fake)


def test_snapshot_keeps_valid_and_retrieval_time_apart_and_gaps_null(monkeypatch):  # T-21
    pushes = []
    stub(monkeypatch, provider_body(), pushes)
    result = openmeteo.push_all("https://core.test/", "key-1")
    assert result["pekanbaru"]["ok"] and result["palangka-raya"]["ok"]
    url, headers, body = pushes[0]
    assert url == "https://core.test/api/v1/internal/areas/pekanbaru/snapshot" and headers == {"X-API-Key": "key-1"}
    assert body["points"] == [{"validAt": "2026-11-20T00:00:00Z", "value": 41.25},
                              {"validAt": "2026-11-20T01:00:00Z", "value": None}]
    assert body["retrievedAt"].endswith("Z") and body["retrievedAt"] != body["points"][0]["validAt"]
    assert body["unit"] == "ug/m3" and body["attributions"] == ["Open-Meteo", "CAMS"] and not body["isSynthetic"]


@pytest.mark.parametrize("provider", [
    upstream.UpstreamError("TimeoutError from open-meteo"),   # timeout
    upstream.UpstreamError("HTTP 429 from open-meteo"),       # rate limited
    {"hourly": {"time": ["2026-11-20T00:00"]}},               # schema changed
    provider_body(unit="ppm"),                                # unexpected unit
    provider_body(times=(), values=()),                       # empty series
])
def test_provider_failure_pushes_nothing_and_does_not_raise(monkeypatch, provider):  # T-23 (push side)
    pushes = []
    stub(monkeypatch, provider, pushes)
    result = openmeteo.push_all("https://core.test", "key-1")
    assert pushes == [] and not result["pekanbaru"]["ok"] and result["pekanbaru"]["error"]
