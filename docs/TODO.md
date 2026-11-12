# Avela Task Tracker

**Updated:** 12 November 2026. Status values: Pending, In progress, Blocked, Done. A task is Done only after its completion criteria in [ARCHITECTURE.md](ARCHITECTURE.md) are checked.

## Next Three Actions

1. Reserve `avela` in the class API Registry (A-22). Names are first come, first served.
2. Contact at least three groups about their APIs (A-03). The DDD paper needs their names by 22 November.
3. Commit the current `services/`, `infra/`, and `docs/` work (A-22).

## M0: Lock and align, by 15 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-00 | Establish documentation baseline | Done | Checked on 10 Nov. |
| A-19 | Refine API selection and design specification | Done | Four probes recorded in API_RESEARCH; contrast pairs checked. |
| A-20 | Plan branching and collaboration | Done | Branch names validated on 10 Nov; catalogue updated 12 Nov. |
| A-01 | Select workflow and demo boundary | Done | D-06, D-14, D-15 confirmed on 12 Nov. |
| A-21 | Realign documentation with decisions and built code | Done | 12 Nov: checks recorded in VALIDATION_REPORT. |
| A-22 | Reserve the Registry name and commit the baseline | Pending | Owner reserves the name and runs the Git commands. |
| A-03 | Agree peer integrations | Pending | Shortlist from the Registry; send the contract request in `skills/integrate-peer-api`. |
| A-04 | Validate the stack on the STB | Pending | Needs the STB and A-22. Docker is not installed on the development machine, so the image build is untested. |

## M1: DDD paper, core v0.2, app skeleton, by 22 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-16 | Submit the DDD paper | In progress | `MAKALAH_DDD.md` and the diagram updated 12 Nov for D-16 and D-17. Copy into the Google Doc, add peer names if known, export, submit. |
| A-06 | Identity and ownership | Done | `test_health_and_login`, `test_resident_cannot_see_other_residents_data`, `test_staff_limited_to_own_facility` pass. |
| A-08 | Symptom reports API | Done | `test_report_validation`, `test_retry_is_idempotent_and_conflicting_reuse_rejected`, `test_cancel_only_before_review` pass. |
| A-09 | Staff review and results API | Done | `test_stale_version_loses`, `test_full_review_cycle_and_result_delivery` pass. Result corrections are not versioned yet. |
| A-23 | Areas and snapshot ingestion | Pending | Add `areas`, `area_snapshots`, the push endpoint, and the advisory endpoint. |
| A-24 | Exposure context on reports | Pending | Requires A-23. `areaId` becomes a required report field; update the tests. |
| A-25 | Peer API keys and public endpoints | Pending | Requires A-23. Confirm P-04 first. |
| A-05 | Scaffold the mobile app | Pending | Confirm P-01 (JavaScript), then create `apps/mobile`. |

## M2: Public core, Registry, resident app, by 29 November

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-13 | Deploy the core on the STB | Pending | Requires A-04 and A-25. |
| A-18 | Publish to the Registry and give peers access | Pending | Requires A-13. |
| A-02 | Finish the data audit | In progress | Open-Meteo probes passed for both areas. Remaining: BMKG codes, quota against the push schedule, ISPU breakpoints (Q-13). |
| A-07 | Environmental context end to end | Pending | Requires A-02, A-05, A-23. |
| A-26 | Resident report flow in the app | Pending | Requires A-05 and A-24. |

## M3: Peer integration, staff screens, resilience, by 6 December

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-10 | Integrate two peer services | Pending | Blocked on A-03 for real endpoints; use contract mocks, labelled, if a peer is late after 29 Nov. |
| A-27 | Staff screens in the app | Pending | Requires A-05. |
| A-12 | Guidance, emergency screen, failure states | Pending | Requires Q-08 for content sources. |
| A-28 | Mobile test suite and test table | Pending | Requires A-10, A-26, A-27. |
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
