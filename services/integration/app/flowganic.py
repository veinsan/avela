"""Anticorruption layer for FlowGanic's Koordinasi Distribusi Sampah: managed waste volume per area (D-23).

FlowGanic reports per RW or kelurahan code. The agreed mapping turns those codes into Avela's pilot areas; a code that
is not in the mapping is dropped, never guessed (T-35). Until the contract and the codes are agreed (Q-03) the adapter
reads a fixture and every answer says isMock (D-35)."""
import json
import os
import pathlib

from . import upstream
from .partners import envelope

FIXTURE = pathlib.Path(__file__).parent.parent / "fixtures" / "flowganic_recap.json"
# Mapping from FlowGanic area codes to Avela areas. Replace with the agreed codes through FLOWGANIC_AREA_CODES,
# a JSON object such as {"pekanbaru": ["14.71.01.1001"], "palangka-raya": ["62.71.01.1001"]}.
MOCK_AREA_CODES = {"pekanbaru": ["MOCK-PKU-RW01", "MOCK-PKU-RW02"], "palangka-raya": ["MOCK-PLK-RW01"]}


def area_codes() -> dict[str, list[str]]:
    raw = os.environ.get("FLOWGANIC_AREA_CODES")
    return json.loads(raw) if raw else MOCK_AREA_CODES


def translate(area_id: str, records: list[dict]) -> dict:
    """Sum FlowGanic's records per waste type for the codes that map to this area."""
    codes = set(area_codes().get(area_id, []))
    totals: dict[str, float] = {}
    periods = set()
    for r in records:
        if r["areaCode"] not in codes:
            continue  # unmapped or another area's code
        totals[r["wasteType"]] = totals.get(r["wasteType"], 0.0) + float(r["managedVolumeKg"])
        periods.add(r["period"])
    return {"areaId": area_id, "period": sorted(periods)[-1] if periods else None,
            "items": [{"wasteType": k, "volumeKg": round(v, 1)} for k, v in sorted(totals.items())]}


def fetch(area_id: str) -> dict:
    base = os.environ.get("FLOWGANIC_BASE_URL")
    if base:
        codes = ",".join(area_codes().get(area_id, []))
        raw = upstream.request_json(f"{base.rstrip('/')}/recap?areaCodes={codes}",
                                    headers={"X-API-Key": os.environ.get("FLOWGANIC_API_KEY", "")})
        records = raw["items"]
    else:
        records = json.loads(FIXTURE.read_text(encoding="utf-8"))["items"]
    return translate(area_id, records)


def waste(area_id: str) -> dict:
    is_mock = not os.environ.get("FLOWGANIC_BASE_URL")
    if area_id not in area_codes():  # no agreed code for this area: unavailable, not an empty recap
        return {"source": "FlowGanic", "retrievedAt": None, "freshness": "unavailable", "isMock": is_mock,
                "data": None}
    return envelope(f"flowganic:{area_id}", "FlowGanic", is_mock, lambda: fetch(area_id))
