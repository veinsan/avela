"""Envelope and last-good cache shared by the partner adapters (NFR-04, NFR-05).

Every answer carries source, retrievedAt, freshness, and isMock. A failed call returns the last good answer marked
stale, or an unavailable envelope; it never raises."""
import logging
import time
from datetime import datetime, timezone
from typing import Callable

from .upstream import UpstreamError

log = logging.getLogger("avela.partners")
CACHE: dict[str, dict] = {}  # shortcut: in-memory, lost on restart; persist it if the laptop restarts often


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def envelope(cache_key: str, source: str, is_mock: bool, fetch: Callable[[], object]) -> dict:
    started = time.monotonic()
    try:
        data = fetch()
    except (UpstreamError, KeyError, TypeError, ValueError) as e:  # a changed schema counts as a failure too
        log.warning("partner=%s key=%s result=error ms=%d error=%s", source, cache_key,
                    (time.monotonic() - started) * 1000, e)
        cached = CACHE.get(cache_key)
        if cached:
            return {**cached, "freshness": "stale"}
        return {"source": source, "retrievedAt": None, "freshness": "unavailable", "isMock": is_mock, "data": None}
    log.info("partner=%s key=%s result=ok ms=%d mock=%s", source, cache_key, (time.monotonic() - started) * 1000,
             is_mock)
    CACHE[cache_key] = {"source": source, "retrievedAt": now_iso(), "freshness": "fresh", "isMock": is_mock,
                        "data": data}
    return CACHE[cache_key]
