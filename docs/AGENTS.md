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

[DESIGN.md](DESIGN.md) holds the tokens and component rules. The mobile theme module, `apps/mobile/src/theme/index.js`, must mirror the frontmatter. The palette is one dark scheme on the 60/30/10 rule (D-36): gray carries the screen, silver the text, and the yellow `accent` fills only the one primary button per screen; never use it for tabs, chips, links, text, or status. Change a token in DESIGN.md first, then in the theme module, in the same change. App text is Indonesian; project documents are English, except the DDD paper.

## Project Structure

```text
services/core/app/     main.py (app, login, /me), care.py (reports, staff review),
                       results.py, environment.py (areas, snapshots, advisory),
                       signal.py (area health signal), guidance.py (guidance content),
                       facilities.py (facility directory),
                       security.py (JWT, roles, API key scopes), keys.py (key CLI),
                       db.py (schema), errors.py, seed.py
services/core/tests/   conftest.py, test_core.py, test_environment.py, test_exposure.py,
                       test_peer_api.py, test_facilities.py, test_result_versions.py
infra/stb/             docker-compose.yml, nginx.conf (rate limits, security headers), .env.example
docs/                  Project documents; docs/skills/ (project skills); docs/submissions/ (course files)
scripts/               md2pdf.py (exports a Markdown deliverable to PDF)
services/integration/  app/ main.py (service, push loop), upstream.py (the only network caller),
                       openmeteo.py (PM2.5 snapshot push), partners.py (envelope, cache),
                       veriqu.py, flowganic.py (anticorruption layers); fixtures/; tests/; README.txt
apps/mobile/           App.js; src/ (config, services/ApiService.js, context/, navigation/, screens/,
                       components/, hooks/, theme/, utils/format.js, utils/log.js); __tests__/; assets/
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
- Never swallow an error. Show the user what failed and what to do next; for a failure the user cannot act on (device storage, update markers), call `logFailure(context, error)` from `apps/mobile/src/utils/log.js`.
- App text has no em dashes and no emoji. Say a missing value in words ("tidak ada data"), never as a dash or zero.
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
- [x] Mobile app: 15 resident and staff screens, login, `ApiService.js`, validated report form, update markers, 60/30/10 dark theme (D-36). Checked on one phone; the staff flow on a device is pending (T-32).
- [x] Deployment on the STB: core v0.2 at `https://avela.stei.fun/api` since 19 November.

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

Run from each directory in Git Bash. Success is every test passing.

| Part | Directory | Commands | Passing on 20 Nov |
| --- | --- | --- | --- |
| Core | `services/core` | `uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt`, then `.venv/Scripts/python.exe -m pytest -q` | 26 |
| Integration service | `services/integration` | The same two commands | 15 |
| Mobile app | `apps/mobile` | `npm install`, then `npm test` | 25 (3 integration tests skipped) |
| Android bundle | `apps/mobile` | `npx expo export --platform android` | Builds; catches import errors without a device |

Notes:

- To run the core locally, follow `services/core/README.md`. Docker is not installed on the development machine; the image is built on the STB (A-04).
- If Windows Smart App Control blocks a DLL in the integration service's new `.venv`, run it with `../core/.venv/Scripts/python.exe`, which pins the same versions.
- The opt-in API integration test drives `ApiService.js` against live services: `AVELA_IT_URL=http://127.0.0.1:8000 AVELA_IT_PASSWORD=<demo password> npm test -- api.integration`. `jest-expo` stubs `fetch` and inlines `EXPO_PUBLIC_*`, so that test brings its own HTTP client and config.
- Pinned versions only; add an app package with `npx expo install`.

Before calling a feature done, apply [the readiness-review skill](skills/review-avela-readiness/SKILL.md). To add a peer integration, follow [the peer-integration skill](skills/integrate-peer-api/SKILL.md).

## Git Rules

The owner stages, commits, and pushes. Do it yourself only when the owner asks for it in that message. After finishing a change, summarize it and give these commands with real values:

1. `git add -- <changed paths>`
2. `git diff --cached`
3. `git commit -m "<message>"`
4. `git push origin <branch>`

Remote `origin` is `https://github.com/veinsan/avela`; the long-lived branch is `main`. Branch naming is in [BRANCH_PLAN.md](BRANCH_PLAN.md).
