# API and Integration Contracts

**Updated:** 12 November 2026. Base URL after deployment: `https://avela.stei.fun`. Application endpoints use the prefix `/api/v1`. The built endpoints are also listed in `services/core/README.md`; FastAPI serves the OpenAPI document at `/openapi.json` and Swagger UI at `/docs`.

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

Codes in use: `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_REVIEWER`, `NOT_FOUND`, `VALIDATION_FAILED`, `UNKNOWN_FACILITY`, `IDEMPOTENCY_CONFLICT`, `VERSION_CONFLICT`, `REPORT_NOT_RESPONDED`, `RATE_LIMITED`.

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
| `GET /api/v1/results`, `GET /api/v1/results/{id}` | Owner (published only) or facility staff | Examination results |

Report body today, with fictional values:

```json
{
  "facilityId": "demo-facility-001",
  "complaint": "Keluhan fiktif untuk pengujian",
  "onsetAt": "2026-11-10T03:00:00Z",
  "course": "unchanged",
  "additionalContext": "Riwayat fiktif",
  "consentVersion": "demo-v1"
}
```

`course` is `better`, `unchanged`, or `worse`. `disposition` is `self_care`, `remote_follow_up`, or `onsite_assessment`.

## Planned Core Endpoints (v0.2)

| Method and path | Caller | Behavior | Task |
| --- | --- | --- | --- |
| `GET /api/v1/areas` | Anyone, rate limited | Lists the pilot areas | A-23 |
| `GET /api/v1/areas/{areaId}/advisory` | Anyone, rate limited | Latest snapshot, category, age, and the 7-day community signal | A-23 |
| `GET /api/v1/guidance` | Anyone, rate limited | Guidance items with sources and version | A-12 |
| `PUT /api/v1/internal/areas/{areaId}/snapshot` | Integration service, scope `snapshots:write` | Stores a snapshot | A-23 |
| `GET /api/v1/public/areas` | Peer key | Same data as `/areas` | A-25 |
| `GET /api/v1/public/areas/{areaId}/advisory` | Peer key | Same data as the open advisory | A-25 |
| `GET /api/v1/public/areas/{areaId}/health-signal?days=7` | Peer key, scope `signal:read` | Daily report counts and totals per disposition; `days` up to 30 | A-25 |
| `GET /api/v1/public/facilities` | Peer key | Facilities that accept Avela reports, with area and review-service status | A-25 |

Changes to built endpoints in v0.2:

- `POST /reports` adds the required field `areaId` (A-24).
- Report detail adds `exposureContext` (A-24).

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
  "current": {"validAt": "2026-11-20T02:00:00Z", "value": 41.2},
  "category": {"standard": "ISPU reference", "label": null},
  "series": [{"validAt": "2026-11-20T02:00:00Z", "value": 41.2}],
  "communitySignal": {"days": 7, "reportCount": 12, "suppressed": false},
  "attributions": ["Open-Meteo", "CAMS"],
  "isSynthetic": false
}
```

`freshness` is `fresh` up to 2 hours after `retrievedAt`, `stale` after that, and `unavailable` when no snapshot exists; in that case `current`, `series`, and `category` are null. `category.label` stays null until the breakpoints are sourced (Q-13).

### Exposure context on a report

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
- Default scopes for a peer: `areas:read`, `signal:read`. Only the integration service has `snapshots:write`.
- A missing or unknown key returns `401 UNAUTHENTICATED`. A key without the scope returns `403 FORBIDDEN`.
- One test account (a resident) is shared with peers so they can try the app-user endpoints.
- Peers report problems as GitHub issues on `veinsan/avela`.

## Integration Service Endpoints (planned)

Base URL `https://avela-int.stei.fun`. The app calls these; the service calls the peers.

| Endpoint | Function | Notes |
| --- | --- | --- |
| `GET /facilities?areaId=` | Facility list from peer group A | Each item names its provider and retrieval time; unknown opening status stays unknown |
| `GET /facilities/{id}` | Facility detail from peer group A | Flags facilities that accept Avela reports |
| One endpoint for peer group B | Depends on the group chosen in Q-03 | Same envelope |
| `GET /health` | Liveness | - |

Every response carries `source`, `retrievedAt`, and `freshness` (`fresh`, `stale`, `unavailable`). An upstream call is abandoned after 10 seconds. The scheduled job pushes one snapshot per area to the core every 60 minutes.

## Peer Integration Slots

Avela needs two different groups (Q-03). Public APIs such as Open-Meteo do not count.

| Slot | What Avela needs | Good candidates in the Registry | Feature in the app |
| --- | --- | --- | --- |
| A | Facilities with location, services, and opening hours | A Health group with a facility or queue service | Fasilitas tab and Detail Fasilitas |
| B, option 1 | Road or flood reports near a route | A Smart City group with citizen reports | Travel warning on Detail Fasilitas when staff advise an onsite visit |
| B, option 2 | Health or safety learning content | An Education group with materials or quizzes | Extra reading under Panduan |
| B, option 3 | Habit or symptom journal | Another Health group | Link from Akun to a personal log |

Pick the options whose owners answer first and whose APIs are live. Record each agreement with [the peer-integration skill](skills/integrate-peer-api/SKILL.md). A mock built from a peer's contract is allowed when the peer is late after 29 November; it is labelled as a mock in the app, the README, and the video.
