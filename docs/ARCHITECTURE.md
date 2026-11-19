# Architecture and Implementation Plan

**Updated:** 19 November 2026. Scope comes from [PRD.md](PRD.md); decisions are in [DECISIONS.md](DECISIONS.md).

## Technical Stack

| Area | Choice | Status |
| --- | --- | --- |
| Core service | Python 3.12, FastAPI 0.162.4, uvicorn 0.54.0, PyJWT 2.15.1 | Built in `services/core` |
| Core database | SQLite in WAL mode on a Docker volume | Built |
| Core tests | pytest 9.2.0 with httpx 0.28.1 | 20 tests pass |
| Python tooling | uv for the virtual environment and installs | In use |
| Gateway | Nginx 1.28 alpine with rate limits | Running on the STB, local check on port 8081 |
| Public access | Cloudflare Tunnel `k01-avela` to `https://avela.stei.fun` | Live: the class route sends `/api/*` to the gateway |
| Integration service | FastAPI, same versions, on the owner's laptop at `https://avela-int.stei.fun` (D-34) | Planned |
| PM2.5 source | Open-Meteo Air Quality, `cams_global` domain | Probed on 10 Nov |
| Mobile app | React Native with Expo, React Navigation (stack and bottom tabs), React Context | Planned; versions pinned at scaffold |
| Mobile language | JavaScript with `ApiService.js` | Confirmed (D-28) |
| Mobile tests | Jest with `jest-expo` and React Native Testing Library | Planned |
| Release | EAS Build, Android APK | Planned |

## System Structure

```text
                         Resident and staff app (Expo APK)
                           |                         |
                 JWT / open endpoints          products, waste recap
                           v                         v
  +---------------- STB (Docker) ---------------+   Integration service (off STB)
  | tunnel -> gateway (Nginx) -> core (FastAPI) |     |-- Open-Meteo Air Quality
  |                               |             |     |-- Veriqu (product catalogue)
  |                            SQLite volume    |     |-- FlowGanic (waste recap)
  +---------------------------------------------+     |
        ^                         ^                   |
        | X-API-Key               +--- PUT snapshot --+
   Other groups' servers              (X-API-Key, scope snapshots:write)
```

### Core service on the STB

Owns everything that needs authorization or domain rules. It never calls an outside API (D-20).

- **Identity and access:** login, JWT sessions, resident and staff roles, facility membership, peer API keys.
- **Care coordination:** symptom reports, the review state machine, events, exposure context.
- **Examination results:** draft and publish, linked to a responded report.
- **Areas:** the two pilot areas and the PM2.5 snapshots pushed for them.
- **Area health signal:** read-only aggregate of reports per area.
- **Guidance:** versioned guidance items with source and review status, shipped with the service.
- **Facility directory:** simulated facilities with services and opening schedule (D-24).
- **Notifications:** update markers derived from report events and published results.

### Integration service outside the STB

- Fetches Open-Meteo for each pilot area on a schedule and pushes the snapshot to the core.
- Calls Veriqu (products) and FlowGanic (waste recap) through one adapter each and translates their models into Avela's terms, including FlowGanic's area codes (D-23).
- Stops waiting after 10 seconds, caches the last good answer, and labels it stale.
- Holds peer and service keys in its own `.env`. No key ships in the APK.

### Mobile app

One APK. After login, the role decides the tabs.

- Resident tabs: Beranda, Laporan, Fasilitas, Akun.
- Staff tabs: Antrean, Akun.
- Stack screens: Masuk, Pilih Wilayah, Panduan, Darurat, Form Laporan, Detail Laporan, Detail Fasilitas, Hasil Pemeriksaan, Tinjau Laporan, Terbitkan Hasil.
- `src/services/ApiService.js` is the only module that calls the core and the integration service.

Screen behavior is in [PRODUCT_FLOWS.md](PRODUCT_FLOWS.md); endpoints are in [API_CONTRACT.md](API_CONTRACT.md).

## Repository Layout

```text
services/core/         Built. app/ (main, care, results, environment, signal, guidance, security, keys, db, errors, seed), tests/, Dockerfile
infra/stb/             Built. docker-compose.yml, nginx.conf, .env.example
services/integration/  Planned. Provider and peer adapters, snapshot push job
apps/mobile/           Planned. Expo app
docs/                  Project documentation
README.md, CLAUDE.md   Repository front page and agent entry point
```

## Data Design

Tables that exist in `services/core/app/db.py`: `facilities`, `accounts`, `memberships`, `reports`, `report_events`, `results`, `areas`, `area_snapshots`, `api_keys`.

Planned additions for core v0.2 (`areas`, `area_snapshots`, and `api_keys` were added in A-23, a key is revoked by deleting its row; `reports.area_id`, `reports.exposure_context`, and `reports.exposure_context_reason` were added in A-24 through the column list in `db.py`, which upgrades an existing database at start):

| Table or column | Purpose |
| --- | --- |
| `facilities.area_id`, `services`, `schedule` | Area link, services, and opening schedule for the directory (A-30) |
| `results.version`, `results.previous_id` | Version history for corrected results (A-31) |

Rules that hold across the design:

- Timestamps travel as UTC ISO-8601. The app shows local time with its zone.
- The owner of a report comes from the token, never from the request body.
- A missing value stays null. It is never sent as zero.
- A snapshot keeps the provider's valid time and the time it was retrieved as separate fields.
- The health signal counts reports by area and day, excludes cancelled reports, and hides counts from 1 to 4.

## Failure Behavior

| Failure | Behavior |
| --- | --- |
| Integration service stops pushing | Core serves the last snapshot with its age; the app marks it stale after 2 hours. |
| No snapshot for an area | Advisory returns an unavailable state. Report submission still works; exposure context is null with a reason. |
| Peer service down or slow | Integration service returns cached data marked stale, or an unavailable state. Reports and results are unaffected. |
| Core database write fails | The request fails with an error. The app keeps the form contents and offers a retry with the same idempotency key. |
| STB power loss | Containers restart (`unless-stopped`); data persists in the `core-data` volume. |

A database backup and restore drill is part of A-13.

## Implementation Plan

Tracks: TST (backend, graded in II3160), PWAM (mobile, graded in II3140), Both. Riantama does every task; Mishael helps with the front-end redesign (D-19). The same IDs appear in [TODO.md](TODO.md).

### M0: Lock and align, by 15 November

| ID | Step | Track | Depends on | Completion criteria |
| --- | --- | --- | --- | --- |
| A-00 | Establish documentation baseline | Both | - | Done on 10 Nov. |
| A-19 | Refine API selection and design specification | Both | A-00 | Done on 10 Nov. |
| A-20 | Plan branching and collaboration | Both | A-00 | Done on 10 Nov. |
| A-01 | Select workflow and demo boundary | Both | A-00 | Workflow, pilot areas, staff surface, and simulated staffing are recorded as confirmed decisions. |
| A-21 | Realign documentation with decisions and built code | Both | A-01 | No document says the stack or workflow is undecided; link, token, and task-ID checks pass. |
| A-22 | Reserve the Registry name and commit the baseline | Both | A-21 | `avela` is reserved in the class API Registry; `services/`, `infra/`, and `docs/` are committed; the assignment PDF is not tracked. |
| A-03 | Agree peer integrations | Both | - | Veriqu, FlowGanic, and one backup each have a written contract: endpoints, schema, rate limit, contact, test access. FlowGanic's codes for both pilot areas are agreed. Contracts by 23 Nov. |
| A-04 | Validate the stack on the STB | TST | A-22 | The core image builds and starts on the STB; `docker stats` shows it inside its limits; data survives `docker compose restart`. |

### M1: DDD paper, core v0.2, app skeleton, by 16 November

The paper was submitted on 16 November. The other M1 steps are due with M2.

| ID | Step | Track | Depends on | Completion criteria |
| --- | --- | --- | --- | --- |
| A-16 | Submit the DDD paper | TST | A-01 | Paper with cover, required paragraph counts, and diagram is exported to .docx or .pdf and submitted. |
| A-06 | Identity and ownership | TST | - | Login, role checks, and facility scope pass negative tests with two residents and two facilities. |
| A-08 | Symptom reports API | TST | A-06 | A valid report persists; a retry returns the same report; a conflicting retry is rejected; only the owner and facility staff read it. |
| A-09 | Staff review and results API | TST | A-08 | Claim, information request, response, close, and result publication pass with version checks and reviewer attribution. |
| A-23 | Areas and snapshot ingestion | TST | A-06 | Both areas are seeded; a push with the service key stores a snapshot; a push without the scope is rejected; the advisory endpoint returns the snapshot with its age. |
| A-24 | Exposure context on reports | TST | A-08, A-23 | A new report stores mean and peak PM2.5 for its window; with no snapshot it stores null and a reason and still saves. |
| A-25 | Peer API keys and public endpoints | TST | A-23 | Keys are created by a command and stored hashed; the advisory, health signal, and guidance endpoints answer with a valid key, 401 without, 403 without the scope; counts from 1 to 4 are hidden. |
| A-05 | Scaffold the mobile app | PWAM | A-06 | The Expo app runs on a device with stack and tab navigation, theme tokens from DESIGN, `ApiService.js`, a working login against the core, and one passing Jest test. |

### M2: Public core, Registry, resident app on own API, by 23 November

| ID | Step | Track | Depends on | Completion criteria |
| --- | --- | --- | --- | --- |
| A-13 | Deploy the core on the STB | TST | A-04, A-25 | `https://avela.stei.fun/api/health` returns 200; limits are set; a burst gets 429; a backup is restored once. |
| A-18 | Publish to the Registry and give peers access | TST | A-13 | The Registry row has the base URL, documentation link, and auth type; Swagger UI is public; a README.pdf draft lists endpoints and how to get a key; a test account exists. |
| A-02 | Finish the data audit | TST | - | BMKG codes for both areas are verified or the weather panel is dropped; Open-Meteo quota fits the push schedule; ISPU breakpoints are sourced (D-29). |
| A-07 | Environmental context end to end | Both | A-02, A-05, A-23 | The integration service pushes snapshots for both areas on a schedule; Beranda shows fresh, stale, and unavailable states with source and time. |
| A-26 | Resident report flow in the app | PWAM | A-05, A-24 | Form validation, submit with retry, report list, detail with timeline and exposure context, reply to an information request, cancel, result view, and update markers work against the deployed core. |

### M3: Peer integration, staff screens, resilience, by 6 December

| ID | Step | Track | Depends on | Completion criteria |
| --- | --- | --- | --- | --- |
| A-10 | Integrate Veriqu and FlowGanic | Both | A-03, A-07 | Veriqu products appear in Panduan and FlowGanic's waste recap on Beranda, each naming its source; request logs are captured; with either peer down the app shows an unavailable state and keeps working. |
| A-27 | Staff screens in the app | PWAM | A-05, A-09 | A staff account reviews a report end to end on a device: queue, claim, ask, respond, close, publish result. |
| A-12 | Guidance, emergency screen, failure states | PWAM | A-07, A-26 | Guidance shows sources; the emergency screen opens signed out; every data screen has loading, empty, error, and stale states. |
| A-28 | Mobile test suite and test table | PWAM | A-10, A-26, A-27 | Jest unit tests cover `ApiService.js`, validation, and state mapping; the functional and integration test table is filled with results. |
| A-30 | Facility directory | Both | A-23 | Facilities carry area, services, and schedule; `GET /api/v1/facilities` lists them by area; Fasilitas and Detail Fasilitas show them with the simulation label and "tidak diketahui" for unknown hours. |
| A-31 | Versioned examination results | TST | A-09 | Correcting a published result creates a new version linked to the previous one; the owner reads the latest and the history; identity linkage follows D-32. |
| A-29 | Peer support and uptime | TST | A-18 | From 23 Nov to grading: health checks are logged and peer issues get a first reply within 24 hours. |

### M4: Release and submission, by 13 December

| ID | Step | Track | Depends on | Completion criteria |
| --- | --- | --- | --- | --- |
| A-14 | Release and test the APK | PWAM | A-12, A-13, A-28 | `Aplikasi_Release.apk` from EAS, with icon and splash, installs on a device and passes the demo script over HTTPS. |
| A-15 | Assemble the submission | Both | A-14, A-16, A-18 | README.pdf, README.txt, testing report PDF, repository README with run steps and demo accounts, and the YouTube video are linked in Edunex. Internal freeze on 11 Dec. |

### Stretch

| ID | Step | Track | Depends on | Completion criteria |
| --- | --- | --- | --- | --- |
| A-11 | Photo attachments | Both | A-26 | Private, size-limited upload with owner-only retrieval and failure handling. |
| R-01 | Custom PM2.5 forecast | TST | A-02 | A holdout comparison against the provider forecast justifies or rejects it. |

A-17 (scope-freeze gate) is retired; the decisions of 12 November replace it.
