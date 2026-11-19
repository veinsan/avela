"""Environment context, conformist to Open-Meteo: fetch the PM2.5 forecast per pilot area and push it to the core.

Usage: python -m app.openmeteo   pushes one snapshot per area once (needs AVELA_SNAPSHOT_KEY)."""
import logging
import os
import urllib.parse
from datetime import datetime, timezone

from . import upstream

log = logging.getLogger("avela.openmeteo")

# Same IDs and coordinates as the core's areas table (DATA_SOURCES, pilot areas).
AREAS = {"pekanbaru": (0.5071, 101.4478), "palangka-raya": (-2.2096, 113.9213)}
URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
UNIT = "μg/m³"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def fetch_snapshot(area_id: str) -> dict:
    """The core's snapshot body for one area. Two past days cover the 48-hour exposure window (A-24)."""
    lat, lon = AREAS[area_id]
    query = urllib.parse.urlencode({"latitude": lat, "longitude": lon, "hourly": "pm2_5", "past_days": 2,
                                    "forecast_days": 2, "domains": "cams_global", "timezone": "GMT"})
    retrieved = now_iso()  # retrieval time, kept apart from each point's valid time (T-21)
    raw = upstream.request_json(f"{URL}?{query}")
    try:
        times, values = raw["hourly"]["time"], raw["hourly"]["pm2_5"]
        unit = raw["hourly_units"]["pm2_5"]
    except (KeyError, TypeError) as e:
        raise upstream.UpstreamError(f"Open-Meteo schema changed: {e}") from e
    if unit != UNIT or len(times) != len(values) or not times:
        raise upstream.UpstreamError(f"Open-Meteo returned unit {unit!r} and {len(times)}/{len(values)} points")
    points = [{"validAt": t + ":00Z" if len(t) == 16 else t, "value": None if v is None else float(v)}
              for t, v in zip(times, values)]  # a provider gap stays null, never zero
    return {"provider": "open-meteo", "modelDomain": "cams_global", "dataKind": "model_forecast", "unit": "ug/m3",
            "retrievedAt": retrieved, "attributions": ["Open-Meteo", "CAMS"], "isSynthetic": False,
            "points": points}


def push_all(core_url: str | None = None, key: str | None = None) -> dict:
    """Fetch and push every area. One area's failure never stops the other; the core keeps its last snapshot."""
    core_url = (core_url or os.environ.get("AVELA_CORE_URL", "https://avela.stei.fun")).rstrip("/")
    key = key or os.environ["AVELA_SNAPSHOT_KEY"]
    results = {}
    for area_id in AREAS:
        try:
            body = fetch_snapshot(area_id)
            upstream.request_json(f"{core_url}/api/v1/internal/areas/{area_id}/snapshot", method="PUT",
                                  headers={"X-API-Key": key}, body=body)
            results[area_id] = {"ok": True, "points": len(body["points"]), "at": now_iso()}
        except upstream.UpstreamError as e:
            results[area_id] = {"ok": False, "error": str(e), "at": now_iso()}
        log.info("snapshot push %s: %s", area_id, results[area_id])
    return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(push_all())
