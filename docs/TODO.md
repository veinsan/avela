# Avela Task Tracker

**Updated:** 19 November 2026. Status values: Pending, In progress, Blocked, Done. A task is Done only after its completion criteria in [ARCHITECTURE.md](ARCHITECTURE.md) are checked.

## Next Three Actions

1. Reserve `avela` in the class API Registry (A-22). Names are first come, first served.
2. Get written contracts from Veriqu and FlowGanic, the two groups named in the DDD paper (A-03), by 23 November.
3. Finish core v0.2 (A-23, A-24, A-25) and deploy it (A-13) before the M2 deadline on 23 November.

## M0: Lock and align, by 15 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-00 | Establish documentation baseline | Done | Checked on 10 Nov. |
| A-19 | Refine API selection and design specification | Done | Four probes recorded in API_RESEARCH; contrast pairs checked. |
| A-20 | Plan branching and collaboration | Done | Branch names validated on 10 Nov; catalogue updated 12 Nov. |
| A-01 | Select workflow and demo boundary | Done | D-06, D-14, D-15 confirmed on 12 Nov. |
| A-21 | Realign documentation with decisions and built code | Done | 12 Nov: checks recorded in VALIDATION_REPORT. |
| A-22 | Reserve the Registry name and commit the baseline | Pending | Owner reserves the name and runs the Git commands. |
| A-03 | Agree peer integrations | In progress | Veriqu and FlowGanic are fixed by the paper (D-23). Send each the contract request in `skills/integrate-peer-api`, agree FlowGanic's area codes, pick a backup. |
| A-04 | Validate the stack on the STB | In progress | 18 Nov: image built on the STB (ARM64); `/health` and `/api/v1/areas` answer on local port 8081; `docker stats`: core 45 MiB of 256, gateway 6 MiB of 64. Host: 913 MiB RAM, 276 MiB available, swap full; disk 21 GB free. Not yet checked: data survives `docker compose restart`, tunnel container memory. |
| A-13 (progress) | Public URL | In progress | 19 Nov: class tunnel live. Routes set by the assistant: `avela.stei.fun/api/*` to `gateway:80`; the rest to aaPanel at `localhost:1122`, reached through the `panel-relay` container. From the laptop `/api/health`, `/api/docs`, `/api/v1/areas` return 200. Not yet checked: 429 burst, backup restore. |

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
| A-05 | Scaffold the mobile app | Pending | JavaScript confirmed (D-28); create `apps/mobile`. |

## M2: Public core, Registry, resident app, by 23 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-13 | Deploy the core on the STB | Pending | Requires A-04 and A-25. |
| A-18 | Publish to the Registry and give peers access | Pending | Requires A-13. |
| A-02 | Finish the data audit | In progress | Open-Meteo probes passed for both areas. ISPU bands sourced (D-29); BMKG panel dropped from the MVP. Remaining: quota against the push schedule, adapter failure paths. |
| A-07 | Environmental context end to end | Pending | Requires A-02, A-05, A-23. |
| A-26 | Resident report flow in the app | Pending | Requires A-05 and A-24. |

## M3: Peer integration, staff screens, resilience, by 6 December

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-10 | Integrate Veriqu and FlowGanic | Pending | Blocked on A-03 for real endpoints; use contract mocks, labelled, if a peer is late after 23 Nov. |
| A-27 | Staff screens in the app | Pending | Requires A-05. |
| A-12 | Guidance, emergency screen, failure states | Pending | Content sources chosen (D-33). |
| A-28 | Mobile test suite and test table | Pending | Requires A-10, A-26, A-27. |
| A-30 | Facility directory | Pending | Requires A-23. Add area, services, and schedule to `facilities` and a list endpoint (D-24). |
| A-31 | Versioned examination results | Pending | Identity linkage confirmed (D-32); add result versions (D-26). |
| A-29 | Peer support and uptime | Pending | Starts when A-18 is done. |

## M4: Release and submission, by 13 December

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-14 | Release and test the APK | Pending | Requires A-12, A-13, A-28. |
| A-15 | Assemble the submission | Pending | Internal freeze on 11 Dec. |

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
| 2026-11-19 | Open choices decided (D-28 to D-35); documents synced with the built core and the public `/api` paths | ISPU table read from the regulation's Lampiran I; `pytest -q`: 12 passed. |
