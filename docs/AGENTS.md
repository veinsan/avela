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
| Expo SDK 58 (expo 58.0.26), React Native 0.88.1, React 19.3.0 | Mobile app in JavaScript (D-28), `apps/mobile` |
| React Navigation 7 | native-stack 7.21.1, bottom-tabs 7.22.0 |
| expo-secure-store 58.0.3 | Session token and chosen area on the device |
| expo-splash-screen 58.0.14 | Splash configured in `app.json`; release APK through EAS (`eas.json`) |
| Jest 30.5.2, jest-expo 58.0.15, Testing Library 14.1.0 | Mobile tests |

Add a dependency only when the standard library or an installed package cannot do the job.

## Design System

[DESIGN.md](DESIGN.md) holds the tokens and component rules. The mobile theme module (planned at `apps/mobile/src/theme/`) must mirror the frontmatter. Change a token in DESIGN.md first, then in the theme module, in the same change. App text is Indonesian; project documents are English, except the DDD paper.

## Project Structure

```text
services/core/app/     main.py (app, login, /me), care.py (reports, staff review),
                       results.py, environment.py (areas, snapshots, advisory),
                       signal.py (area health signal), guidance.py (guidance content),
                       facilities.py (facility directory),
                       security.py (JWT, roles, API key scopes), keys.py (key CLI),
                       db.py (schema), errors.py, seed.py
services/core/tests/   conftest.py, test_core.py, test_environment.py
infra/stb/             docker-compose.yml, nginx.conf, .env.example
docs/                  Project documents and docs/skills/
services/integration/  app/ main.py (service, push loop), upstream.py (the only network caller),
                       openmeteo.py (PM2.5 snapshot push), partners.py (envelope, cache),
                       veriqu.py, flowganic.py (anticorruption layers); fixtures/; tests/; README.txt
apps/mobile/           App.js; src/ (config, services/ApiService.js, context/, navigation/,
                       screens/, components/ui.js, theme/, utils/format.js); __tests__/
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
- [x] Areas, pushed PM2.5 snapshots, advisory, API key CLI.
- [x] Exposure context on reports.
- [x] Peer API keys and public endpoints (advisory, health signal, guidance).
- [x] Facility directory with services and schedule.
- [x] Versioned examination results.
- [x] Integration service: snapshot push and partner adapters (partners on labelled fixtures until A-03).
- [ ] Mobile app: scaffold, theme, `ApiService.js`, login, and account done; feature screens in progress.
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

Success is all tests passing; 26 pass on 19 November. To run the service locally, follow `services/core/README.md`. Docker is not installed on the development machine; the image is built on the STB (A-04, 18 November).

Integration service, from `services/integration`: the same two commands; 15 pass on 19 November. If Windows Smart App Control blocks a DLL in its new `.venv`, run it with `../core/.venv/Scripts/python.exe`, which pins the same versions. Run steps are in its `README.txt`.

Mobile app, from `apps/mobile`: `npm install`, then `npm test` (Jest) and `npx expo start` (Expo Go). `npx expo export --platform android` bundles the app without a device and catches import errors. The opt-in API integration test runs against live services: `AVELA_IT_URL=http://127.0.0.1:8000 AVELA_IT_PASSWORD=<demo password> npm test -- api.integration`; `jest-expo` stubs `fetch` and inlines `EXPO_PUBLIC_*`, so that test brings its own HTTP client and config. Pinned versions only; add a package with `npx expo install`.

Before calling a feature done, apply [the readiness-review skill](skills/review-avela-readiness/SKILL.md). To add a peer integration, follow [the peer-integration skill](skills/integrate-peer-api/SKILL.md).

## Git Rules

The owner stages, commits, and pushes. Do it yourself only when the owner asks for it in that message. After finishing a change, summarize it and give these commands with real values:

1. `git add -- <changed paths>`
2. `git diff --cached`
3. `git commit -m "<message>"`
4. `git push origin <branch>`

Remote `origin` is `https://github.com/veinsan/avela`; the long-lived branch is `main`. Branch naming is in [BRANCH_PLAN.md](BRANCH_PLAN.md).
