# Avela Task Tracker

**Updated:** 19 November 2026. Status values: Pending, In progress, Blocked, Done. A task is Done only after its completion criteria in [ARCHITECTURE.md](ARCHITECTURE.md) are checked.

## Next Three Actions

Code for every task is in the repository as of 19 November. What is left needs the owner's accounts, the STB, a phone, or another group:

Core v0.2 is live on the STB and listed in the Registry (19 Nov). Left before 23 November:

1. Run the app on a phone with Expo Go against `avela.stei.fun` (A-05, A-26, A-27) and keep the integration service running on the laptop so the hourly PM2.5 push continues (A-07).
2. Send Veriqu and FlowGanic the contract request in `skills/integrate-peer-api`, their keys, and the `uji-mitra` password; ask for FlowGanic's area codes (A-03, A-18).
3. Then M3 and M4: the `avela-int` tunnel and live partner calls (A-10), the EAS APK and functional table (A-14), PDFs and video (A-15).

## M0: Lock and align, by 15 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-00 | Establish documentation baseline | Done | Checked on 10 Nov. |
| A-19 | Refine API selection and design specification | Done | Four probes recorded in API_RESEARCH; contrast pairs checked. |
| A-20 | Plan branching and collaboration | Done | Branch names validated on 10 Nov; catalogue updated 12 Nov. |
| A-01 | Select workflow and demo boundary | Done | D-06, D-14, D-15 confirmed on 12 Nov. |
| A-21 | Realign documentation with decisions and built code | Done | 12 Nov: checks recorded in VALIDATION_REPORT. |
| A-22 | Reserve the Registry name and commit the baseline | Done | 19 Nov: `avela` reserved and its Registry row filled by the owner; the baseline is on `main` (PRs #1 to #8). |
| A-03 | Agree peer integrations | In progress | Veriqu and FlowGanic are fixed by the paper (D-23). Send each the contract request in `skills/integrate-peer-api`, agree FlowGanic's area codes, pick a backup. |
| A-04 | Validate the stack on the STB | Done | 18 Nov: image built on the STB (ARM64); `/health` and `/api/v1/areas` answer on local port 8081; `docker stats`: core 45 MiB of 256, gateway 6 MiB of 64. Host: 913 MiB RAM, 276 MiB available, swap full; disk 21 GB free. 19 Nov: v0.2 rebuilt on the STB; `docker stats`: core 42 MiB of 256, gateway 2 MiB of 64, tunnel 30 MiB of 64, panel-relay 0.4 MiB of 16; MySQL and phpMyAdmin no longer running. Data survived `docker compose restart core` (facilities and accounts still readable). |
| A-13 (progress) | Public URL | Done | 19 Nov: class tunnel live. Routes set by the assistant: `avela.stei.fun/api/*` to `gateway:80`; the rest to aaPanel at `localhost:1122`, reached through the `panel-relay` container. From the laptop `/api/health`, `/api/docs`, `/api/v1/areas` return 200. Rest of A-13 recorded in its M2 row. |

## M1: DDD paper, core v0.2, app skeleton, by 16 November

The paper was submitted on 16 November. The other M1 tasks are late and are due with M2 on 23 November.

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-16 | Submit the DDD paper | Done | Submitted 16 Nov as `Makalah_DDD.docx`. |
| A-06 | Identity and ownership | Done | `test_health_and_login`, `test_resident_cannot_see_other_residents_data`, `test_staff_limited_to_own_facility` pass. |
| A-08 | Symptom reports API | Done | `test_report_validation`, `test_retry_is_idempotent_and_conflicting_reuse_rejected`, `test_cancel_only_before_review` pass. |
| A-09 | Staff review and results API | Done | `test_stale_version_loses`, `test_full_review_cycle_and_result_delivery` pass. Result versioning is A-31. |
| A-23 | Areas and snapshot ingestion | Done | 17 Nov: `test_environment.py` (4 tests) passes: both areas seeded, push rejected without key (401) and without scope (403), stored with `snapshots:write`, advisory fresh/stale/unavailable with age, keys stored hashed. `app.keys` CLI smoke-tested. Not run: Docker build (A-04). `communitySignal` stays null until A-25. |
| A-24 | Exposure context on reports | Done | 19 Nov: `test_exposure.py` (4 tests) passes: mean and peak over the onset window, provider gaps and points outside the window left out, context frozen against later pushes, null with `no_snapshot` and still saved, unknown or missing area rejected, an old `reports` table gains the columns. `pytest -q`: 16 passed. Not run: STB upgrade of the live database (A-13). |
| A-25 | Peer API keys and public endpoints | Done | 19 Nov: `test_peer_api.py` (4 tests) passes: every public path gives 401 without or with an unknown key, 403 without the scope, 200 with it; health signal hides 1 to 4, keeps zero, drops cancelled reports, and carries no text, account, or facility; `days` over 30 rejected; advisory `communitySignal` filled; ISPU category from the 24-hour mean (D-29); guidance items name a source. `pytest -q`: 20 passed. Not run: peer keys on the STB (A-18). |
| A-05 | Scaffold the mobile app | In progress | 19 Nov: `apps/mobile` on Expo SDK 58 with pinned versions; theme tokens mirrored from DESIGN (since 20 Nov the single dark 60/30/10 palette, D-36); `ApiService.js` (timeout, Indonesian error messages, 401 sign-out, idempotency header, partner calls that never throw); session in SecureStore; stack and tab navigation by role; Masuk and Akun screens. `npm test`: 16 passed; `npx expo export --platform android` bundles. Not run: the app on a device (owner, with Expo Go). |

## M2: Public core, Registry, resident app, by 23 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-13 | Deploy the core on the STB | Done | 19 Nov: `main` pulled into `/www/apps/avela` on the STB, database backed up (`avela-pre-v02.db`), core rebuilt, seed rerun. From the laptop over HTTPS: `/api/health` 200; 28 OpenAPI paths; `/api/v1/facilities` lists both facilities with their areas; `/api/v1/public/areas` without a key gives 401; 60 parallel requests to `/api/v1/areas` gave 46 x 200 and 14 x 429. Restore drill: backup copied out, restored through SQLite's backup API, core restarted; health 200 and data intact (the core needs more than 5 seconds to start, so an immediate local check showed a 502). |
| A-18 | Publish to the Registry and give peers access | In progress | 19 Nov: `services/core/README.md` is the README.pdf source (architecture, endpoints, access steps, limits, example requests, Registry row, peer agreement table); `uji-mitra` test account with its own password (`test_peer_test_account_has_its_own_password`); backup and restore commands checked on a local SQLite file. 19 Nov on the STB: seed rerun with `AVELA_PEER_TEST_PASSWORD`; keys `veriqu` and `flowganic` created with `areas:read guidance:read signal:read`. Registry row filled 19 Nov (A-22). Owner step left: send each group its key and the `uji-mitra` password. |
| A-02 | Finish the data audit | Done | 19 Nov: ISPU bands read from the regulation (D-29); BMKG panel dropped from the MVP; the push makes 48 Open-Meteo calls a day against a 10,000 limit; failure paths (timeout, 429, changed schema, wrong unit, empty series) pass in `services/integration/tests/test_openmeteo.py`. |
| A-07 | Environmental context end to end | In progress | 19 Nov, service side done: `services/integration` pushes both areas every 60 minutes; `pytest -q` there: 6 passed. Live check: a real Open-Meteo fetch pushed 96 points per area into a local core, and the advisory answered `fresh` with an ISPU label. App side done 19 Nov: Beranda shows value, unit, valid time, source, age, ISPU reference label, stale and unavailable states, next hours, and the community signal. Live 19 Nov: key `integration` created on the STB; `python -m app.openmeteo` from the laptop pushed 96 points per area to `avela.stei.fun`; both advisories answered `fresh` with an ISPU label (Pekanbaru 16.4 µg/m³, Baik; Palangka Raya 5.2 µg/m³, Baik). Remaining: keep the push running (`uvicorn app.main:app --port 8100` on the laptop) and check Beranda on a device; the `avela-int` tunnel is needed only for the partner endpoints (M3). |
| A-26 | Resident report flow in the app | In progress | 19 Nov, built: Laporan tab (receipt notice, list, results, update markers, tab badge), Form Laporan (area, facility from the directory, complaint, onset hours, course, history, consent; inline errors; review step; retry with the same key and onset), Detail Laporan (state, "Terkirim, belum ditinjau", staff response with disposition, reply to an information request, cancel with confirmation, exposure context, timeline, linked results, version-conflict reload), Hasil Pemeriksaan (version, history, newer-correction notice), latest report on Beranda. `npm test`: 23 passed (`reportForm.test.js` covers validation and same-key retry); Android bundle builds. Remaining: run against the deployed core on a device (needs A-13). |

## M3: Peer integration, staff screens, resilience, by 6 December

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-10 | Integrate Veriqu and FlowGanic | In progress | 19 Nov: both anticorruption layers built in `services/integration` (`veriqu.py`, `flowganic.py`) with envelope, last-good cache, request log lines, and labelled fixtures (D-35); `test_partners.py` (9 tests) passes: translation, mock label, timeout, 429, and changed schema give stale or unavailable, unmapped codes dropped. `pytest -q` there: 15 passed. Remaining: live endpoints and keys from A-03, then request logs and screenshots for the README and video. |
| A-27 | Staff screens in the app | In progress | 19 Nov, built: Antrean (oldest first, state filter, state in text, waiting time, who claimed), Tinjau Laporan (complaint, exposure context, timeline, one primary action per state, only the claimer responds or closes, version-conflict reload), Terbitkan Hasil (draft, preview, publish; a correction becomes a new version). Core now returns `reviewerId` and `reviewerName`. `npm test`: 25 passed (`staff.test.js`); core `pytest -q`: 26 passed; Android bundle builds. Remaining: the end-to-end staff run on a device against the deployed core (T-32). |
| A-12 | Guidance, emergency screen, failure states | Done | 19 Nov: Panduan shows each item's source link, review status, and version, then Veriqu products with source and mock label; Darurat ships its contacts in the app, opens signed out and offline, and dials 119 or 112; Beranda, Pilih Wilayah, Panduan, Fasilitas, and Detail Fasilitas have loading skeletons, empty text, error with retry, stale and partner-unavailable states; a Darurat button sits in every header. `npm test`: 21 passed; Android bundle builds. Not run: device checks T-18 and T-24. |
| A-28 | Mobile test suite and test table | In progress | 19 Nov: Jest covers `ApiService.js`, validation, state mapping, role routing, the report form, staff rules, and partner states (25 passed); `api.integration.test.js` ran `ApiService.js` against a local core and integration service (3 passed). [TESTING_REPORT.md](TESTING_REPORT.md) holds the suites, the 19-row functional table, and the bugs found. Remaining: fill the device columns on the release APK (A-14) and export the PDF. |
| A-30 | Facility directory | Done | 19 Nov, API: `test_facilities.py` (4 tests) passes: list by area, simulation flag, `closed` versus unknown hours, 404 for an unknown ID, a report's facility must be in its area, seed upgrades old facility rows. `pytest -q`: 24 passed. Screens: Fasilitas (area filter, simulation label, today's hours in WIB) and Detail Fasilitas (services, week schedule, "Tidak diketahui" apart from "Tutup"); `todayHours` covered in `__tests__/screens.test.js`. Not run: a device check. |
| A-31 | Versioned examination results | Done | 19 Nov: `test_result_versions.py` passes: correction drafts version 2 linked to version 1, other facility gets 404, a second open correction and a correction of a draft get 409, the owner keeps seeing version 1 until version 2 is published, then reads version 2 with its history and version 1 with `supersededBy`; staff list both versions. `pytest -q`: 25 passed. Screen in A-26. |
| A-29 | Peer support and uptime | Pending | Starts when A-18 is done. |

## M4: Release and submission, by 13 December

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-14 | Release and test the APK | In progress | 19 Nov: Avela icon, adaptive icon (with monochrome layer), and splash generated from the DESIGN colors (redrawn 20 Nov for D-36: gray ground, silver mark, yellow haze line); `eas.json` builds an APK with the HTTPS URLs; release steps in `apps/mobile/README.md`; `npx expo export --platform android` and `npx expo config` pass. Remaining (owner): `eas build -p android --profile production` with the owner's Expo account, rename to `Aplikasi_Release.apk`, install, and run the functional table. |
| A-15 | Assemble the submission | In progress | 19 Nov: root README with features, layout, run steps, and demo accounts; `services/core/README.pdf` exported from its README with `scripts/md2pdf.py`; `services/integration/README.txt`; `apps/mobile/README.md` with run steps, demo accounts, and release steps; testing report source in `docs/TESTING_REPORT.md`. Remaining: testing report PDF after the device run, YouTube video with both members, Edunex links. Internal freeze on 11 Dec. |

## Stretch

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-11 | Photo attachments | Pending | Start only after M3 passes (P-03). |
| R-01 | Custom PM2.5 forecast | Pending | Start only after M3 passes (P-03). |

## Verification Log

| Date | Work | Result |
| --- | --- | --- |
| 2026-11-10 | Documentation baseline, API shortlist, design refinement, branch plan | Link, token, and task-ID checks passed; details in VALIDATION_REPORT. |
| 2026-11-11 | Core API v1 built | 8 pytest tests passed locally; a live smoke test created a report on a temporary database. |
| 2026-11-12 | Documentation realigned (A-21) | `pytest -q` in `services/core`: 8 passed. Document checks in VALIDATION_REPORT. |
| 2026-11-17 | DDD paper submitted (A-16); M2 moved to 23 Nov; task split updated (D-19) | Paper drafts and diagram removed; `Makalah_DDD.docx` is the record. |
| 2026-11-17 | Documents aligned with the submitted paper (D-22 to D-27); A-30 and A-31 added | Checks in VALIDATION_REPORT; `pytest -q`: 8 passed. |
| 2026-11-17 | A-23 areas, snapshot push, advisory, API key mechanism (`app.keys`) | `pytest -q` in `services/core`: 12 passed. |
| 2026-11-20 | Redesign step 2: layout, components, icons, and motion on the D-36 palette (DESIGN v0.4 components and motion table) | `npm test`: 25 passed; Android bundle builds; no semicolon, bullet, middle dot, em dash, or emoji left in app text. Not run: a look at the screens on a device (a web preview could not reach the connected browser). |
| 2026-11-20 | Anti-slop review: security headers on the gateway, missing values in words, no swallowed errors, README environment variables and deploy | Findings and checks in VALIDATION_REPORT. Owner step: on the STB, `docker compose exec gateway nginx -t`, then `docker compose exec gateway nginx -s reload`. |
| 2026-11-20 | Redesign step 1: 60/30/10 palette (D-36) in DESIGN, the theme module, components, `app.json`, icon, and splash | Contrast of every token pair computed, all pass; `npm test`: 25 passed; Android bundle builds. Not run: device check. |
| 2026-11-19 | Core v0.2 deployed on the STB (A-04, A-13), PM2.5 pushed live (A-07), peer keys created (A-18) | HTTPS checks, 429 burst, and restore drill in the A-13 row. |
| 2026-11-19 | A-24, A-25, A-30, A-31 core; A-18 README; A-02, A-07, A-10 integration service; A-05, A-12, A-26, A-27, A-28, A-14 app; A-15 documents | Core `pytest -q`: 26 passed. Integration `pytest -q`: 15 passed. App `npm test`: 25 passed; `api.integration` against local services: 3 passed; `npx expo export --platform android` builds. Live Open-Meteo push into a local core. Document checks in VALIDATION_REPORT. |
| 2026-11-19 | Open choices decided (D-28 to D-35); documents synced with the built core and the public `/api` paths | ISPU table read from the regulation's Lampiran I; `pytest -q`: 12 passed. |
