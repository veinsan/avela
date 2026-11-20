# Avela Core API

Core microservice of Avela, a mobile companion for residents in wildfire-smoke areas. It owns reports, staff review, examination results, pilot areas with pushed PM2.5 snapshots, the anonymous area health signal, guidance, and the simulated facility directory. FastAPI and SQLite in Docker on the class set-top box (STB). Coursework for II3160 and II3140, ITB, class K01. All accounts, facilities, and cases are fictional; Avela does not diagnose.

This file is the source of the backend `README.pdf`; regenerate it with `scripts/md2pdf.py` after editing.

## Base URL and Documentation

| Item | Value |
| --- | --- |
| Base URL | `https://avela.stei.fun/api/v1` |
| Swagger UI | `https://avela.stei.fun/api/docs` |
| OpenAPI | `https://avela.stei.fun/api/openapi.json` |
| Liveness | `https://avela.stei.fun/api/health` |
| Auth | `Authorization: Bearer <token>` for app users; `X-API-Key` for other groups' servers |
| Issues | GitHub issues on `veinsan/avela`; first reply within 24 hours |

API Registry row: group `avela`, class K01, theme Health & Wellbeing, base URL `https://avela.stei.fun/api`, documentation `https://avela.stei.fun/api/docs`, auth `X-API-Key` and Bearer JWT, status Online.

## Architecture

```text
 Avela app (Expo APK) ---- Bearer JWT ----+
                                          v
 Other groups' servers -- X-API-Key --> Cloudflare Tunnel (avela.stei.fun, /api/*)
                                          |
                    STB (Docker) ---------+--------------------------------+
                    | gateway: Nginx, rate limits, 64 MB / 0.25 CPU        |
                    | core: FastAPI + SQLite volume, 256 MB / 0.5 CPU      |
                    | tunnel: cloudflared, 64 MB / 0.25 CPU                |
                    +------------------------------------------------------+
                                          ^
 Integration service (laptop, avela-int.stei.fun) -- PUT snapshot, X-API-Key snapshots:write
   Open-Meteo PM2.5, Veriqu products, FlowGanic waste recap
```

The core never calls an outside API. The integration service pulls Open-Meteo every 60 minutes and pushes one snapshot per area; it also adapts the Veriqu and FlowGanic services for the app. The database port is never exposed.

## Getting Access

1. **Public data, no key:** `GET /areas`, `GET /areas/{areaId}/advisory`, `GET /guidance`, `GET /facilities`. Rate limited.
2. **Peer group key:** open a GitHub issue on `veinsan/avela` titled `API key: <group>` with your group name, class, and contact. We create one key per group with the scopes `areas:read signal:read guidance:read` and send it privately. It is shown once; we store only its hash. A leaked key is revoked and replaced.
3. **Test account:** a resident account `uji-mitra` lets you try the app-user endpoints. Its password is sent with your key; it is separate from our demo accounts.

A missing or unknown key returns `401 UNAUTHENTICATED`; a key without the scope returns `403 FORBIDDEN`. A peer key never reads reports, identities, or results.

## Limits

| Limit | Value |
| --- | --- |
| Requests per client IP | 10 per second, burst 20; then `429 RATE_LIMITED` |
| Logins per client IP | 5 per minute, burst 5 |
| Session token | 12 hours |
| Request body | 64 KB |
| List paging | `limit` 1 to 50 (default 20), `offset` |
| Security headers | Every answer carries `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer` |

## Endpoints (`/api/v1`)

| Method and path | Actor | Purpose |
| --- | --- | --- |
| `GET /health`, `GET /api/health` (no `/v1`) | Public | Liveness |
| `POST /auth/login` | Any | Returns bearer token |
| `GET /me` | Signed in | Own profile, role, facilities |
| `POST /reports` | Resident | Submit report; requires `Idempotency-Key` header |
| `GET /reports`, `GET /reports/{id}` | Resident (own) / facility staff | List and detail with event timeline and exposure context |
| `POST /reports/{id}/updates` | Owner | Add information; replying to an information request returns the case to review |
| `POST /reports/{id}/cancel` | Owner | Cancel before review |
| `GET /staff/reports?state=` | Staff | Queue for own facilities, oldest first |
| `POST /staff/reports/{id}/claim` | Staff | `submitted` to `in_review` |
| `POST /staff/reports/{id}/information-requests` | Reviewer | `in_review` to `awaiting_information` |
| `POST /staff/reports/{id}/responses` | Reviewer | Publish response, `in_review` to `responded` |
| `POST /staff/reports/{id}/close` | Reviewer | `responded` to `closed` |
| `POST /staff/results`, `POST /staff/results/{id}/publish` | Facility staff | Draft and publish result linked to a responded report |
| `POST /staff/results/{id}/corrections`, `GET /staff/results?reportId=` | Facility staff | Draft a correction as a new version; list a report's result versions |
| `GET /results`, `GET /results/{id}` | Owner (published) / facility staff | Latest published versions; detail with version history |
| `GET /areas` | Public | The two pilot areas |
| `GET /areas/{areaId}/advisory` | Public | Latest PM2.5 snapshot: freshness (`fresh` up to 2 h, then `stale`; `unavailable` if none), ISPU reference category, 7-day community signal |
| `GET /guidance` | Public | Protection guidance with sources and review status, emergency contacts |
| `GET /facilities?areaId=`, `GET /facilities/{id}` | Public | Simulated facility directory with services and schedule |
| `GET /public/areas`, `GET /public/areas/{areaId}/advisory` | `X-API-Key` with `areas:read` | Areas and advisory for peer groups |
| `GET /public/areas/{areaId}/health-signal?days=7` | `X-API-Key` with `signal:read` | Anonymous report counts per day and disposition; counts 1 to 4 are null |
| `GET /public/guidance` | `X-API-Key` with `guidance:read` | Guidance for peer groups |
| `PUT /internal/areas/{areaId}/snapshot` | `X-API-Key` with `snapshots:write` | Integration service pushes a snapshot |

Area IDs: `pekanbaru`, `palangka-raya`. Full request and response schemas are in Swagger UI.

## Example Requests

Smoke advisory for Pekanbaru (public):

```bash
curl https://avela.stei.fun/api/v1/areas/pekanbaru/advisory
```

Area health signal for the last 7 days (peer key):

```bash
curl -H "X-API-Key: $AVELA_KEY" "https://avela.stei.fun/api/v1/public/areas/pekanbaru/health-signal?days=7"
```

```json
{
  "areaId": "pekanbaru",
  "days": 7,
  "daily": [{"date": "2026-11-20", "reportCount": null, "suppressed": true}],
  "dispositions": {"self_care": 0, "remote_follow_up": null, "onsite_assessment": 0},
  "suppressionRule": "Counts from 1 to 4 are hidden.",
  "isSynthetic": true
}
```

Sign in and submit a report as a resident:

```bash
TOKEN=$(curl -s -X POST https://avela.stei.fun/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"username": "uji-mitra", "password": "<password>"}' | python -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
curl -X POST https://avela.stei.fun/api/v1/reports -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -H "Idempotency-Key: uji-$(date +%s)" \
  -d '{"areaId": "pekanbaru", "facilityId": "demo-facility-001", "complaint": "Keluhan fiktif untuk uji",
       "onsetAt": "2026-11-20T01:00:00Z", "course": "unchanged", "consentVersion": "demo-v1"}'
```

Retrying with the same `Idempotency-Key` and body returns the same report (`200`); a different body under that key returns `409 IDEMPOTENCY_CONFLICT`.

## Errors

Every error has the shape `{"error": {"code", "message", "requestId", "retryable"}}`. State changes take `expectedVersion`; a stale version returns `409 VERSION_CONFLICT`. Another person's resource returns `404 NOT_FOUND`. Codes: `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_REVIEWER`, `NOT_FOUND`, `VALIDATION_FAILED`, `UNKNOWN_AREA`, `UNKNOWN_FACILITY`, `IDEMPOTENCY_CONFLICT`, `VERSION_CONFLICT`, `REPORT_NOT_RESPONDED`, `RATE_LIMITED`.

## Peer Agreements

The two groups Avela consumes are fixed by the DDD paper. Each agreement is recorded here and in the partner's README.

| Field | Veriqu | FlowGanic |
| --- | --- | --- |
| Their context | Katalog Produk | Koordinasi Distribusi Sampah |
| What Avela uses | Products with rating summaries, shown in Panduan | Managed waste volume per area and waste type, shown on Beranda |
| Endpoints, data format, call limit, contact | Pending written contract | Pending written contract and area codes |
| Mock in use | Yes, labelled, until the contract is signed | Yes, labelled, until the contract is signed |

No resident data is sent to either group.

## Run Locally

```bash
uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt
export AVELA_JWT_SECRET=$(python -c "import secrets;print(secrets.token_urlsafe(48))") AVELA_DEMO_PASSWORD=choose-a-demo-password
.venv/Scripts/python.exe -m app.seed
.venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

Interactive docs: `http://127.0.0.1:8000/api/docs`. Tests: `.venv/Scripts/python.exe -m pytest -q`.

Demo accounts (password from `AVELA_DEMO_PASSWORD`): `warga1`, `warga2` (residents), `petugas1` (demo-facility-001, Pekanbaru), `petugas2` (demo-facility-002, Palangka Raya). Set `AVELA_PEER_TEST_PASSWORD` before seeding to create `uji-mitra`.

## Deploy on the STB

```bash
cd infra/stb && cp .env.example .env   # fill in secrets
docker compose up -d --build
docker compose exec core python -m app.seed   # rerun after every upgrade; it is idempotent
curl http://127.0.0.1:8081/health
```

After `git pull` changes `nginx.conf`, run `docker compose up -d --force-recreate gateway`, not `nginx -s reload`. The file is bind-mounted on its own, and the pull replaces it with a new file, so a running container keeps reading the old one. Check with `curl -sI http://127.0.0.1:8081/api/health`: the response must carry `Content-Security-Policy`.

Starting the service adds new columns to an existing database; the seed then fills facility details. Back up the database before an upgrade:

```bash
docker compose exec core python -c "import sqlite3; s=sqlite3.connect('/data/avela.db'); s.backup(sqlite3.connect('/data/backup.db'))"
docker compose cp core:/data/backup.db ./avela-$(date +%Y%m%d).db
```

Restore a backup into the running database (SQLite's backup API also clears the write-ahead log), then restart:

```bash
docker compose cp ./avela-YYYYMMDD.db core:/data/restore.db
docker compose exec core python -c "import sqlite3; sqlite3.connect('/data/restore.db').backup(sqlite3.connect('/data/avela.db'))"
docker compose restart core
sleep 15 && curl http://127.0.0.1:8081/api/health   # the core needs a few seconds to start on the STB
```

## API Keys

Keys are created on the server, shown once, and stored as a SHA-256 hash:

```bash
docker compose exec core python -m app.keys create integration snapshots:write
docker compose exec core python -m app.keys create <group> areas:read signal:read guidance:read
docker compose exec core python -m app.keys list
docker compose exec core python -m app.keys revoke <group>
```

A report carries `areaId` (required; its facility must be in that area) and the exposure context frozen at submission: mean and peak forecast PM2.5 for the area from onset to submission, or null with `exposureContextReason: "no_snapshot"`.
