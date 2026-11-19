"""The only module that calls the network. Every failure becomes UpstreamError, never a crash."""
import json
import urllib.error
import urllib.request

TIMEOUT_SECONDS = 10  # NFR-05
USER_AGENT = "Avela-integration/0.2 (coursework)"


class UpstreamError(Exception):
    pass


def request_json(url: str, method: str = "GET", headers: dict | None = None, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    all_headers = {"User-Agent": USER_AGENT, "Accept": "application/json", **(headers or {})}
    if data is not None:
        all_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method, headers=all_headers)
    try:
        # shortcut: the timeout applies to each socket wait, not the whole call; use a deadline if a peer trickles bytes.
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise UpstreamError(f"HTTP {e.code} from {url.split('?')[0]}") from e
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as e:
        raise UpstreamError(f"{type(e).__name__} from {url.split('?')[0]}") from e
