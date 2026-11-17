# Avela Agent and Developer Instructions

Avela is a mobile companion for residents in wildfire-smoke areas: area smoke forecast, symptom reports reviewed by facility staff, and onsite examination results. It is the joint coursework for II3160 (TST) and II3140 (PWAM), due 13 December 2026.

Read [TODO.md](TODO.md) and [WORKFLOW.md](WORKFLOW.md) before starting. The submitted DDD paper, [Makalah_DDD.docx](Makalah_DDD.docx), is the source of truth for the domain and partners; [DOMAIN_MODEL.md](DOMAIN_MODEL.md) is its English copy. Scope is in [PRD.md](PRD.md); the plan is in [ARCHITECTURE.md](ARCHITECTURE.md); decisions are in [DECISIONS.md](DECISIONS.md).

The root `CLAUDE.md` imports this file. Agents that do not read `CLAUDE.md` must open this file themselves.

## Tech Stack

| Tool | Version or role |
| --- | --- |
| Python | 3.12 in Docker; the local virtual environment is managed with uv |
| FastAPI | 0.162.4, core API |
| uvicorn | 0.54.0 |
| PyJWT | 2.15.1, HS256 session tokens |
| SQLite | WAL mode, file at `AVELA_DB_PATH` |
| pytest, httpx | 9.2.0 and 0.28.1, core tests |
| Nginx | 1.28 alpine, gateway and rate limits |
| cloudflared | Tunnel to `https://avela.stei.fun` |
| Expo, React Navigation, Jest | Mobile app; not scaffolded yet, pin versions in A-05 |

Add a dependency only when the standard library or an installed package cannot do the job.

## Design System

[DESIGN.md](DESIGN.md) holds the tokens and component rules. The mobile theme module (planned at `apps/mobile/src/theme/`) must mirror the frontmatter. Change a token in DESIGN.md first, then in the theme module, in the same change. App text is Indonesian; project documents are English, except the DDD paper.

## Project Structure

```text
services/core/app/     main.py (app, login, /me), care.py (reports, staff review),
                       results.py, security.py (JWT, roles), db.py (schema), errors.py, seed.py
services/core/tests/   conftest.py, test_core.py
infra/stb/             docker-compose.yml, nginx.conf, .env.example
docs/                  Project documents and docs/skills/
services/integration/  Planned: provider and peer adapters
apps/mobile/           Planned: Expo app
```

One bounded context per module in `services/core/app`. A new context gets its own module and router, included in `main.py`.

## Code Conventions

- Derive the acting account from the token. Never accept an owner, reviewer, or role from the request body.
- Return 404 for a resource the caller may not see, so its existence is not revealed.
- Raise `ApiError` from `errors.py`; every error uses the `{"error": {code, message, requestId, retryable}}` shape.
- Change report state only through `transition()` in `care.py`, with the caller's `expectedVersion`.
- Write an event with `add_event()` in the same transaction as the state change.
- Send timestamps as UTC ISO-8601 from `now()` in `db.py`. Keep a missing value null.
- The core never calls an outside API. Provider and peer calls belong in `services/integration`.
- In the app, only `ApiService.js` calls the network. Screens get data through it.
- Mark a known shortcut with a comment: `shortcut: <the limit>, <when to upgrade>`.
- When a request is ambiguous and the answer changes behavior, ask before coding.

## Features

- [x] Login, session token, and `/me` with role and facilities.
- [x] Symptom report: create with idempotency key, list, detail with timeline, update, cancel.
- [x] Staff review: queue, claim, information request, response with disposition, close.
- [x] Examination result: draft, publish, owner-only read.
- [x] Gateway configuration with rate limits and container limits.
- [ ] Areas, pushed PM2.5 snapshots, exposure context on reports.
- [ ] Peer API keys and public endpoints (advisory, health signal, guidance).
- [ ] Facility directory with services and schedule.
- [ ] Versioned examination results.
- [ ] Integration service.
- [ ] Mobile app.
- [ ] Deployment on the STB.

Keep the behavior of checked features unless the task says to change it.

## Do Not

- Use real patient data, real photos, or a real person's identity. All accounts and cases are synthetic.
- Commit `.env`, tokens, API keys, database files, or the assignment PDF. The PDF contains shared course credentials; never copy them anywhere.
- Run a frontend, a mobile build, an AI model, or integration calls on the STB.
- Put a peer key or service key in the mobile app.
- Present software output as a diagnosis or as a staff member's advice.
- Promise a response time or continuous monitoring in any screen text.
- Expose the database port.
- Call a planned feature done, or a mock a live integration.

## Testing and Build

Run from `services/core` in Git Bash:

```bash
uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt
.venv/Scripts/python.exe -m pytest -q
```

Success is all tests passing; 8 pass on 12 November. To run the service locally, follow `services/core/README.md`. The Docker image has not been built yet because Docker is not installed on the development machine; A-04 covers it on the STB.

Mobile and integration commands do not exist yet. Add them here when A-05 and A-07 create them.

Before calling a feature done, apply [the readiness-review skill](skills/review-avela-readiness/SKILL.md). To add a peer integration, follow [the peer-integration skill](skills/integrate-peer-api/SKILL.md).

## Git Rules

The owner stages, commits, and pushes. Do it yourself only when the owner asks for it in that message. After finishing a change, summarize it and give these commands with real values:

1. `git add -- <changed paths>`
2. `git diff --cached`
3. `git commit -m "<message>"`
4. `git push origin <branch>`

Remote `origin` is `https://github.com/veinsan/avela`; the long-lived branch is `main`. Branch naming is in [BRANCH_PLAN.md](BRANCH_PLAN.md).
