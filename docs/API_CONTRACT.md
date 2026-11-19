# API and Integration Contracts

**Updated:** 19 November 2026. Base URL after deployment: `https://avela.stei.fun`. Application endpoints use the prefix `/api/v1`. The built endpoints are also listed in `services/core/README.md`; FastAPI serves the OpenAPI document at `/api/openapi.json`, Swagger UI at `/api/docs`, and liveness at `/api/health`. The class tunnel forwards only `/api/*` to the gateway; other paths on the hostname go to the server panel.

## Conventions

- JSON bodies; timestamps in UTC ISO-8601; server-generated opaque IDs.
- App users send `Authorization: Bearer <token>`. Other groups and the integration service send `X-API-Key`.
- State-changing report actions send `expectedVersion`. A stale version returns `409 VERSION_CONFLICT`.
- A resource the caller may not see returns `404 NOT_FOUND`.
- Lists take `limit` (1-50, default 20) and `offset`.

Every error has this shape:

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "The resource changed or is not in a valid state for this action.",
    "requestId": "9f1c0f6e-demo",
    "retryable": false
  }
}
```

Codes in use: `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_REVIEWER`, `NOT_FOUND`, `VALIDATION_FAILED`, `UNKNOWN_FACILITY`, `UNKNOWN_AREA`, `IDEMPOTENCY_CONFLICT`, `VERSION_CONFLICT`, `REPORT_NOT_RESPONDED`, `RATE_LIMITED`.

## Built Core Endpoints

| Method and path | Caller | Behavior |
| --- | --- | --- |
| `GET /health` | Anyone | Liveness |
| `POST /api/v1/auth/login` | Anyone | Returns a bearer token valid for 12 hours |
| `GET /api/v1/me` | Signed in | Own profile, role, and facilities |
| `POST /api/v1/reports` | Resident | Creates a report; requires the `Idempotency-Key` header |
| `GET /api/v1/reports` | Resident | Own reports |
| `GET /api/v1/reports/{id}` | Owner or facility staff | Detail with the event timeline |
| `POST /api/v1/reports/{id}/updates` | Owner | Adds information; a reply to an information request returns the report to review |
| `POST /api/v1/reports/{id}/cancel` | Owner | Cancels a report that is still `submitted` |
| `GET /api/v1/staff/reports?state=` | Staff | Queue for the caller's facilities |
| `POST /api/v1/staff/reports/{id}/claim` | Staff | `submitted` to `in_review` |
| `POST /api/v1/staff/reports/{id}/information-requests` | Reviewer | `in_review` to `awaiting_information` |
| `POST /api/v1/staff/reports/{id}/responses` | Reviewer | Publishes a response with a disposition; `in_review` to `responded` |
| `POST /api/v1/staff/reports/{id}/close` | Reviewer | `responded` to `closed` |
| `POST /api/v1/staff/results` | Facility staff | Drafts a result for a responded report |
| `POST /api/v1/staff/results/{id}/publish` | Facility staff | Publishes the draft |
| `POST /api/v1/staff/results/{id}/corrections` | Facility staff | Drafts a correction of the latest published version as version + 1; `409` when the result is a draft, already corrected, or has an open correction (A-31) |
| `GET /api/v1/staff/results?reportId=` | Facility staff | Every version of the report's results, drafts included |
| `GET /api/v1/results`, `GET /api/v1/results/{id}` | Owner (published only) or facility staff | The list holds the latest published version of each result; a detail carries `version`, `previousId`, `supersededBy`, and `history` (earlier versions, newest first) |
| `GET /api/v1/areas` | Anyone, rate limited | Lists the pilot areas |
| `GET /api/v1/areas/{areaId}/advisory` | Anyone, rate limited | Latest snapshot with freshness, `ageMinutes`, the ISPU reference category, and the 7-day `communitySignal` |
| `PUT /api/v1/internal/areas/{areaId}/snapshot` | Integration service, scope `snapshots:write` | Stores a snapshot (A-23) |
| `GET /api/v1/guidance` | Anyone, rate limited | Guidance items with source, version, and review status, plus emergency contacts (D-33) |
| `GET /api/v1/public/areas` | Peer key, scope `areas:read` | Same data as `/areas` (A-25) |
| `GET /api/v1/public/areas/{areaId}/advisory` | Peer key, scope `areas:read` | Same data as the open advisory (A-25) |
| `GET /api/v1/public/areas/{areaId}/health-signal?days=7` | Peer key, scope `signal:read` | Daily report counts and totals per disposition; `days` 1 to 30 (A-25) |
| `GET /api/v1/public/guidance` | Peer key, scope `guidance:read` | Avela's own guidance items with sources; no peer data (A-25) |
| `GET /api/v1/facilities?areaId=` | Anyone, rate limited | Simulated facility directory with area, services, and opening schedule (A-30) |
| `GET /api/v1/facilities/{id}` | Anyone, rate limited | One facility (A-30) |

Snapshot push body, with illustrative values. `isSynthetic` marks a hand-made test push; `value` may be null for a provider gap; `retrievedAt` more than 5 minutes in the future is rejected.

```json
{
  "provider": "open-meteo",
  "modelDomain": "cams_global",
  "retrievedAt": "2026-11-20T02:00:00Z",
  "attributions": ["Open-Meteo", "CAMS"],
  "isSynthetic": false,
  "points": [{"validAt": "2026-11-20T02:00:00Z", "value": 41.2}]
}
```

Report body, with fictional values. `areaId` is required (A-24):

```json
{
  "areaId": "pekanbaru",
  "facilityId": "demo-facility-001",
  "complaint": "Keluhan fiktif untuk pengujian",
  "onsetAt": "2026-11-10T03:00:00Z",
  "course": "unchanged",
  "additionalContext": "Riwayat fiktif",
  "consentVersion": "demo-v1"
}
```

The facility must belong to the chosen area, otherwise `422 UNKNOWN_FACILITY`. `course` is `better`, `unchanged`, or `worse`. `disposition` is `self_care`, `remote_follow_up`, or `onsite_assessment`.

## Planned Core Endpoints (v0.2)

| Method and path | Caller | Behavior | Task |
| --- | --- | --- | --- |

Changes to built endpoints in v0.2:


### Facility

```json
{
  "id": "demo-facility-002",
  "name": "Klinik Simulasi Avela B",
  "areaId": "palangka-raya",
  "areaName": "Palangka Raya",
  "services": ["Pemeriksaan umum", "Konsultasi dokter"],
  "schedule": [{"day": "fri", "hours": "08:00-16:00"}, {"day": "sat", "hours": null}, {"day": "sun", "hours": null}],
  "isSimulated": true
}
```

`schedule` lists Monday to Sunday (shortened above). `hours` is `HH:MM-HH:MM` in WIB, `closed`, or null when unknown; a null `schedule` means nothing is known.

### Advisory response

Illustrative values, not a captured response.

```json
{
  "areaId": "pekanbaru",
  "areaName": "Pekanbaru",
  "dataKind": "model_forecast",
  "provider": "open-meteo",
  "modelDomain": "cams_global",
  "pollutant": "pm2_5",
  "unit": "ug/m3",
  "retrievedAt": "2026-11-20T02:00:00Z",
  "freshness": "fresh",
  "ageMinutes": 25,
  "current": {"validAt": "2026-11-20T02:00:00Z", "value": 41.2},
  "category": {"standard": "ISPU reference (Permen LHK P.14/2020)", "basis": "24h_mean_forecast", "label": "Sedang", "mean24h": 38.7},
  "series": [{"validAt": "2026-11-20T02:00:00Z", "value": 41.2}],
  "communitySignal": {"days": 7, "reportCount": 12, "suppressed": false},
  "attributions": ["Open-Meteo", "CAMS"],
  "isSynthetic": false
}
```

`freshness` is `fresh` up to 2 hours after `retrievedAt`, `stale` after that, and `unavailable` when no snapshot exists; in that case `current`, `series`, and `category` are null. `category.label` places `mean24h`, the mean of the forecast values valid in the last 24 hours, in the PM2.5 bands of Permen LHK P.14/2020 (D-29); it is null with fewer than 18 values. `communitySignal` is filled even when no snapshot exists; a count from 1 to 4 is null with `suppressed: true`.

### Exposure context on a report

Built in A-24. Every report response carries `areaId`, `exposureContext`, and `exposureContextReason`; reports created before A-24 have all three null.

```json
{
  "exposureContext": {
    "areaId": "pekanbaru",
    "windowStart": "2026-11-19T20:00:00Z",
    "windowEnd": "2026-11-20T02:10:00Z",
    "meanPm25": 38.4,
    "peakPm25": 52.0,
    "points": 7,
    "unit": "ug/m3",
    "provider": "open-meteo",
    "dataKind": "model_forecast",
    "retrievedAt": "2026-11-20T02:00:00Z"
  },
  "exposureContextReason": null
}
```

The window runs from `onsetAt` to submission, limited to the last 48 hours. With no snapshot point in the window, `exposureContext` is null and `exposureContextReason` is `no_snapshot`.

### Health signal response

```json
{
  "areaId": "pekanbaru",
  "days": 7,
  "daily": [
    {"date": "2026-11-19", "reportCount": 6, "suppressed": false},
    {"date": "2026-11-20", "reportCount": null, "suppressed": true}
  ],
  "dispositions": {"self_care": 5, "remote_follow_up": null, "onsite_assessment": 6},
  "suppressionRule": "Counts from 1 to 4 are hidden.",
  "isSynthetic": true
}
```

Dates are calendar days in WIB. Cancelled reports are not counted. A hidden count is null, never zero.

## Peer Access

- Each group gets one key, created with a command on the STB and shown once. The core stores its hash, the group name, and its scopes.
- Default scopes for a peer: `areas:read`, `signal:read`, `guidance:read`. Only the integration service has `snapshots:write`.
- A missing or unknown key returns `401 UNAUTHENTICATED`. A key without the scope returns `403 FORBIDDEN`.
- One test account, the resident `uji-mitra`, is shared with peers so they can try the app-user endpoints. Its password (`AVELA_PEER_TEST_PASSWORD`) is separate from the demo accounts'.
- Peers request a key and report problems as GitHub issues on `veinsan/avela`. The steps, limits, and example requests are in `services/core/README.md`, the source of `README.pdf`.

## Integration Service Endpoints (planned)

Base URL `https://avela-int.stei.fun`. The app calls these; the service calls the peers.

| Endpoint | Function | Notes |
| --- | --- | --- |
| `GET /guidance/products` | Protective products from Veriqu's catalogue, with rating summary | Shown in Panduan; the source is named |
| `GET /areas/{areaId}/waste` | FlowGanic's managed waste volume per waste type, mapped to the pilot area | Shown on Beranda; an unmapped area returns `unavailable` |
| `GET /health` | Liveness | - |

Every response carries `source`, `retrievedAt`, and `freshness` (`fresh`, `stale`, `unavailable`). An upstream call is abandoned after 10 seconds. The scheduled job pushes one snapshot per area to the core every 60 minutes.

## Peer Integrations

The two groups are fixed by the DDD paper (D-23). Public APIs such as Open-Meteo do not count.

| Group | Their context | What Avela takes | Translation in the adapter | Feature in the app |
| --- | --- | --- | --- | --- |
| Veriqu | Katalog Produk | Products with rating summaries | Product to protective-product item: name, category, rating summary, link | Product recommendations in Panduan |
| FlowGanic | Koordinasi Distribusi Sampah | Managed waste volume per RW or kelurahan and waste type | Their area code to Avela's pilot area through the agreed mapping; volumes summed per waste type | Waste section in the environment part of Beranda |

No resident data is sent to either group. Their endpoint paths, limits, and keys go in the contract (Q-03). Record each agreement with [the peer-integration skill](skills/integrate-peer-api/SKILL.md). A mock built from a peer's contract is allowed when the peer is late after 23 November; it is labelled as a mock in the app, the README, and the video.
