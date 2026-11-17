# Avela Core API

Core microservice for Avela (Care Coordination and Examination Result contexts). FastAPI + SQLite, deployed on the STB with Docker. All accounts and cases are synthetic coursework data.

## Run locally

```bash
uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt
export AVELA_JWT_SECRET=$(python -c "import secrets;print(secrets.token_urlsafe(48))") AVELA_DEMO_PASSWORD=choose-a-demo-password
.venv/Scripts/python.exe -m app.seed
.venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

Interactive docs: `http://127.0.0.1:8000/docs`. Tests: `.venv/Scripts/python.exe -m pytest -q`.

Demo accounts (password from `AVELA_DEMO_PASSWORD`): `warga1`, `warga2` (residents), `petugas1` (demo-facility-001), `petugas2` (demo-facility-002).

## Deploy on the STB

```bash
cd infra/stb && cp .env.example .env   # fill in secrets
docker compose up -d --build
docker compose exec core python -m app.seed
curl http://127.0.0.1:8081/health
```

Limits: core 256 MB / 0.5 CPU, gateway and tunnel 64 MB / 0.25 CPU each. Nginx rate-limits the API (10 r/s) and login (5 r/min). The database lives in the `core-data` volume and is never exposed.

## Endpoints (`/api/v1`)

| Method and path | Actor | Purpose |
| --- | --- | --- |
| `GET /health` (no prefix) | Public | Liveness |
| `POST /auth/login` | Any | Returns bearer token |
| `GET /me` | Signed in | Own profile, role, facilities |
| `POST /reports` | Resident | Submit report; requires `Idempotency-Key` header |
| `GET /reports`, `GET /reports/{id}` | Resident (own) / facility staff | List and detail with event timeline |
| `POST /reports/{id}/updates` | Owner | Add information; replying to an information request returns the case to review |
| `POST /reports/{id}/cancel` | Owner | Cancel before review |
| `GET /staff/reports?state=` | Staff | Queue for own facilities |
| `POST /staff/reports/{id}/claim` | Staff | `submitted` to `in_review` |
| `POST /staff/reports/{id}/information-requests` | Reviewer | `in_review` to `awaiting_information` |
| `POST /staff/reports/{id}/responses` | Reviewer | Publish response, `in_review` to `responded` |
| `POST /staff/reports/{id}/close` | Reviewer | `responded` to `closed` |
| `POST /staff/results`, `POST /staff/results/{id}/publish` | Facility staff | Draft and publish result linked to a responded report |
| `GET /results`, `GET /results/{id}` | Owner (published) / facility staff | Examination results |
| `GET /areas` | Public | The two pilot areas |
| `GET /areas/{areaId}/advisory` | Public | Latest PM2.5 snapshot with freshness (`fresh` up to 2 h, then `stale`; `unavailable` if none) |
| `PUT /internal/areas/{areaId}/snapshot` | `X-API-Key` with `snapshots:write` | Integration service pushes a snapshot |

## API keys

Server callers (peer groups, the integration service) send `X-API-Key`. Keys are created on the server, shown once, and stored as a SHA-256 hash:

```bash
docker compose exec core python -m app.keys create integration snapshots:write
docker compose exec core python -m app.keys create <group> areas:read signal:read guidance:read
docker compose exec core python -m app.keys list
docker compose exec core python -m app.keys revoke <group>
```

A missing or unknown key returns `401`; a key without the scope returns `403`.

State changes take `expectedVersion`; a stale version returns `409 VERSION_CONFLICT`. Other people's resources return `404`. Errors use `{"error": {"code", "message", "requestId", "retryable"}}`.

Not yet included: the public peer endpoints and health signal (A-25), exposure context on reports (A-24), versioned result corrections, attachments.
