# Draft API and Integration Contracts

**Status:** Design draft, not an implemented API, OpenAPI export, or agreement with another group. Base URL and versions remain pending.

## Conventions

Proposed prefix `/api/v1`. JSON uses explicit schemas and ISO-8601 UTC timestamps. Server generates opaque resource IDs. Authenticate resident/staff sessions through a selected mechanism; JWT is a course example, not yet an installed implementation. Use separately scoped API keys for peer servers. Document pagination and errors in the eventual OpenAPI contract.

Error shape proposal:

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The selected service is currently unavailable.",
    "requestId": "demo-request-001",
    "retryable": true
  }
}
```

Do not return stack traces or patient information in errors. Distinguish authentication failure, forbidden access, validation failure, version conflict, upstream unavailability, and rate limits. A 404 policy may conceal unauthorized resource existence if applied consistently.

## Proposed Core Endpoints

| Method and path | Actor | Behavior |
| --- | --- | --- |
| `GET /health` | Public, limited | Minimal service availability, no sensitive config |
| `POST /auth/login` | Resident/staff | Authenticates an existing demo account |
| `GET /me` | Authenticated | Returns own permitted profile and memberships |
| `POST /reports` | Resident | Creates own report using an idempotency key |
| `GET /reports` | Resident | Lists own reports with bounded pagination |
| `GET /reports/{id}` | Owner or permitted facility staff | Returns authorized case detail |
| `POST /reports/{id}/updates` | Owner or reviewer | Appends information according to case state |
| `POST /reports/{id}/cancel` | Owner | Cancels an unreviewed report using expected version |
| `GET /staff/reports` | Facility staff | Lists queue within server-authorized facility scope |
| `POST /staff/reports/{id}/claim` | Facility staff | Claims review with optimistic concurrency |
| `POST /staff/reports/{id}/information-requests` | Reviewer | Publishes clarification request |
| `POST /staff/reports/{id}/responses` | Reviewer | Publishes attributed response and changes state atomically |
| `POST /staff/reports/{id}/close` | Reviewer | Closes a responded case |
| `POST /staff/results` | Authorized result publisher | Creates a result draft after verified patient linkage |
| `POST /staff/results/{id}/publish` | Authorized publisher | Publishes a versioned result |
| `GET /results/{id}` | Linked resident or permitted staff | Reads only an authorized published result |

Optional attachment endpoints must be specified after storage selection. Avoid a public `/uploads` directory. An external result-ingestion endpoint needs its own publisher authorization and linkage contract; it is not covered by generic peer API-key access.

### Report Write Example

Fictional payload; not a clinical questionnaire or approved triage protocol:

```json
{
  "facilityId": "demo-facility-001",
  "complaint": "Synthetic demonstration complaint",
  "onsetAt": "2026-11-10T03:00:00Z",
  "course": "unchanged",
  "additionalContext": "Fictional history for testing only",
  "consentVersion": "demo-v1"
}
```

There is deliberately no client-selected owner ID or reviewer role. The server derives the owner from credentials, validates the facility, and persists consent metadata. The same idempotency key and same payload return the same logical report; conflicting reuse returns a documented conflict. No exact retention window is selected yet.

## Proposed Integration Endpoints

| Endpoint | Function | Required metadata |
| --- | --- | --- |
| `GET /areas?query=...` | Indonesia-filtered manual place search | Internal area ID, provider ID namespace, label, coordinates, timezone; BMKG mapping optional |
| `GET /environment?areaId=...` | Normalized environmental context | Source, unit, valid time, fetched time, observation/forecast type, freshness, resolution |
| `GET /weather?areaId=...` | Optional BMKG weather via reviewed area mapping | BMKG administrative code, valid time, production time, attribution; unavailable when no mapping exists |
| `GET /facilities?areaId=...` | Peer directory results | Provider record ID, verification time, services, unknown fields |
| `GET /facilities/{id}/availability` | Peer operational information | Status, valid time, provider, simulation flag |
| `GET /guidance?topic=...` | Reviewed published content if selected | Source, version, review status, applicability limits |

Missing provider data must be represented as missing, not zero. A successful empty response is distinct from a timeout. Provider outages must preserve attribution of any cached content.

## Provider Adapter Contract

Recommended adapters and evidence are in [DATA_SOURCES.md](DATA_SOURCES.md) and [API_RESEARCH.md](API_RESEARCH.md). These are design changes, not deployed endpoints.

- `openMeteoAirQuality`: normalized regional forecasts; no station-observation claim.
- `openMeteoGeocoding`: manual place lookup; preserve provider ID namespace.
- `bmkgWeather`: query only with a reviewed BMKG administrative-code mapping.
- `openAqObservations`: optional, server-keyed station source after coverage audit.
- `facilityDirectory`: contracted peer records and optionally reviewed OSM imports; availability remains a separate record.

Provider endpoints are server configuration, not arbitrary URLs supplied by the client. Resolve internal area IDs through reviewed records. Environmental requests need area coordinates, not a resident's symptom history or account identity. Request coalescing and quota budgets are provider-specific.

### Environmental Response Shape

Illustrative normalized payload, not a captured response. Null values are intentional; do not invent measured values or model issue times.

```json
{
  "areaId": "demo-pekanbaru",
  "dataKind": "model_forecast",
  "provider": "open-meteo",
  "modelDomain": "cams_global",
  "requestedCoordinates": {"latitude": 0.5071, "longitude": 101.4478},
  "gridCoordinates": {"latitude": 0.5, "longitude": 101.399994},
  "spatialResolutionKmApprox": 45,
  "issuedAt": null,
  "retrievedAt": null,
  "freshness": "unknown",
  "pollutant": "pm2_5",
  "unit": "ug/m3",
  "aqiStandard": null,
  "uncertainty": null,
  "series": [],
  "attributions": ["Open-Meteo", "CAMS"],
  "isSynthetic": true
}
```

Each real series point has `validAt` in UTC and `value` as number or null. Successful upstream retrieval must set `retrievedAt`; `issuedAt` remains nullable unless provided by a documented source. `generationtime_ms` must never populate `issuedAt`. The sampled API grid coordinates differ from requested coordinates, so keep both.

Freshness values are proposed as `fresh`, `stale`, `unknown`, or `unavailable`, derived by a provider-specific policy. A cache TTL is not a medical safety rule. A top-level partial-result response should identify which provider failed without erasing usable data from other providers.

### Identifier and Facility Rules

GeoNames ID, BMKG `adm4`, internal Avela area ID, and OSM element identity use separate namespaces. Never cast one into another. Facilities retain provider ID/type, coordinates, source retrieval time, and optional human verification time. Availability is `unknown` unless an appropriate operational source establishes it. OSM coordinates alone do not establish a clinical relationship.

### Attribution and Licensing

Pass attribution metadata to the app rather than hiding it in backend logs. Separate permissions for display, caching, redistribution, and paid use. Avela's peer-facing snapshots may expose only data whose redistribution is permitted; WAQI is not included as a silent cached fallback. Authentication of a source does not grant arbitrary reuse rights.

## Peer Integration Plan

| Slot | Candidate service role | Example user-visible use | Status |
| --- | --- | --- | --- |
| Peer A | Facility directory and service schedule | Resident finds a relevant examination location | No group selected or contacted |
| Peer B | Appointment/examination demo service, or reviewed health-content service | Resident receives linked exam result or accesses sourced guidance | No group selected; choose scope after available contracts |

These roles are suggestions, not claims that classmates provide them. Two APIs from the same group do not satisfy two-group integration. Public NASA/weather APIs do not count. If the chosen Peer B does not provide results, Avela can own simulated result publication while still integrating Peer B meaningfully elsewhere.

## Avela API for Other Groups

Candidate public offering: normalized, source-attributed environmental context and reviewed protection-information metadata for an area. The core server may serve persisted snapshots prepared by the off-STB integration service; it must not become an STB-hosted integration orchestrator. Confirm this offering is useful with actual peers.

Peer consumers receive no generic access to symptom reports, patient identities, or examination results. Record consumer-specific keys, quotas, revocation process, contact, and examples. Secrets belong in configuration, never shared Markdown.

## Agreement Checklist

For each peer record: group identity, contact, base URL, schema/version, authentication scope, test account, synthetic fixtures, rate limit, timeout, cache allowance, error semantics, availability expectation, contract-change procedure, and README links on both sides. Capture request/response evidence without credentials or health details.

Mock endpoints require explicit labels and an agreed schema. The assignment permits mocks when peers are late, with reporting to the assistant after the specified deadline; do not silently present a mock as a working live integration.
