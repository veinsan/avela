# Test Plan

**Updated:** 19 November 2026. Core tests exist and pass (26 of 26, `pytest -q` in `services/core`). No mobile or integration tests exist yet.

## Layers

| Layer | Tool | Where | State |
| --- | --- | --- | --- |
| Core API | pytest with FastAPI TestClient on a temporary database | `services/core/tests` | 26 tests pass |
| Integration service | pytest with stubbed upstream responses | `services/integration/tests` | 15 tests pass (A-07, A-10) |
| Mobile unit | Jest with `jest-expo` | `apps/mobile/__tests__` | 25 tests pass (A-05, A-12, A-26, A-27) |
| Mobile API integration | Jest driving `ApiService.js` against running services | `apps/mobile/__tests__/api.integration.test.js` | 3 pass against local services (A-28) |
| Functional and integration table | Manual steps on the installed APK against deployed services | [TESTING_REPORT.md](TESTING_REPORT.md), exported to PDF | Table written; device columns pending (A-14) |
| Deployment | Commands on the STB | Evidence in README.pdf | Planned (A-13) |

## Acceptance Scenarios

Status: Pass (automated test passes), Partial, Planned, Stretch.

| ID | Scenario and expected result | Requirement | Status |
| --- | --- | --- | --- |
| T-01 | The resident picks an area from the pilot list; no location permission is requested. | US-01 | Partial: Pilih Wilayah lists the two areas with an offline fallback; `app.json` declares no location permission; device check in A-14 |
| T-02 | No snapshot: advisory is unavailable and shows no value. | US-01, NFR-04 | Pass (API): `test_areas_seeded_and_advisory_unavailable_without_snapshot`; Beranda shows no value and no category (manual check in A-14) |
| T-03 | Advisory shows source, unit, valid time, and snapshot age. | FR-02 | Pass (API): `test_pushed_snapshot_feeds_advisory`; Beranda shows all four (manual check in A-14) |
| T-04 | The emergency screen opens signed out, without a report. | US-05 | Pass: `the emergency screen needs no data and lists 119 and 112` |
| T-05 | A valid report is saved and visible only to its owner and facility staff. | US-03 | Pass: `test_resident_cannot_see_other_residents_data`. Restart survival is checked in A-13. |
| T-06 | A retried submit creates one report; a different body under the same key is rejected. | NFR-06 | Pass: `test_retry_is_idempotent_and_conflicting_reuse_rejected` |
| T-07 | Resident A cannot read or change Resident B's report or result. | NFR-01 | Pass: `test_resident_cannot_see_other_residents_data`, `test_full_review_cycle_and_result_delivery` |
| T-08 | Staff of facility A cannot see facility B's queue, reports, or results. | NFR-01 | Pass: `test_staff_limited_to_own_facility` |
| T-09 | Two actions on the same version: only the first succeeds. | NFR-06 | Pass: `test_stale_version_loses` |
| T-10 | Information request and resident reply keep author and order. | US-06 | Pass: `test_full_review_cycle_and_result_delivery` |
| T-11 | A submitted report never appears as reviewed. | US-05, G-03 | Pass: API state, `a submitted report never reads as reviewed`; screen copy audit in A-28 |
| T-12 | A published result reaches only the report's owner; a draft stays hidden. | US-08 | Pass: `test_full_review_cycle_and_result_delivery` |
| T-13 | Attachment upload fails or is skipped: the report still works. | FR-05 | Stretch |
| T-14 | Veriqu products show in Panduan and FlowGanic's waste recap on Beranda, each with its source and a request log. | FR-10, US-02, US-13 | Partial: screens and adapters built on labelled fixtures; live calls and logs wait on A-03 |
| T-15 | Peer timeout, 429, or malformed body: the app shows an unavailable state and keeps working. | NFR-04 | Pass: `test_veriqu_failure_serves_last_good_answer_as_stale_or_unavailable`, `a partner outage becomes an unavailable envelope instead of an error`, `a partner outage collapses to one line and hides the content` |
| T-16 | STB restart keeps the database; limits are set; no outbound provider call from the core. | NFR-03 | Pass on the STB 19 Nov: data intact after restart and restore, `docker stats` inside every limit, snapshots arrive by push only |
| T-17 | HTTPS works; a burst gets 429; no secret is in the APK or the repository. | NFR-08 | Partial: HTTPS and 429 pass on `avela.stei.fun` (19 Nov); repository scan clean; APK check in A-14 |
| T-18 | Large text, status without color, and form errors are usable on a device. | NFR-07 | Planned, A-12 |
| T-19 | The release APK installs; login, 4+ screens, stack and tab navigation, and the validated form work. | C-07, C-11 | Planned, A-14 |
| T-20 | Fixtures, logs, screenshots, and the video contain only synthetic people. | NFR-02 | Planned, A-15 |
| T-21 | The Open-Meteo adapter keeps valid time and retrieval time separate and sends missing values as null. | FR-15 | Pass: `test_snapshot_keeps_valid_and_retrieval_time_apart_and_gaps_null` |
| T-23 | Upstream failure in the integration service returns cached data marked stale, within 10 seconds. | NFR-05 | Pass: `test_provider_failure_pushes_nothing_and_does_not_raise`, `test_veriqu_failure_serves_last_good_answer_as_stale_or_unavailable` |
| T-24 | The single dark theme stays readable on a device, including in bright light; a squint test shows only the yellow primary button; TalkBack labels, Android Back, and keyboard insets work. | NFR-07 | Partial: token contrast computed (DESIGN, Contrast); device check in A-14 |
| T-25 | A facility with an unknown schedule is shown as unknown, under the simulation label. | US-07 | Partial: API passes `test_unknown_hours_stay_unknown`, `today's hours use WIB and keep unknown apart from closed` |
| T-26 | A report submitted when a snapshot covers its window stores mean and peak PM2.5. | US-10, FR-13 | Pass (API): `test_report_freezes_exposure_context` |
| T-27 | A report submitted with no snapshot saves with a null exposure context and a reason. | US-10 | Pass: `test_report_without_snapshot_still_saves` |
| T-28 | A snapshot push without the `snapshots:write` scope is rejected. | FR-15 | Pass: `test_snapshot_push_requires_scoped_key` |
| T-29 | The health signal hides counts from 1 to 4, leaves out cancelled reports, and returns no text, account, or facility. | US-11, NFR-10 | Pass: `test_health_signal_hides_small_counts_and_cancelled_reports` |
| T-30 | Public endpoints: no key gives 401, a key without the scope gives 403, a valid key gives 200. | US-09 | Pass: `test_public_endpoints_need_a_scoped_key` |
| T-31 | A snapshot older than 2 hours is marked stale in the advisory and on Beranda. | US-01 | Partial: API passes `test_old_snapshot_is_stale_and_keys_are_stored_hashed`; Beranda shows "Data tersimpan" (manual check in A-14) |
| T-32 | A staff account completes queue, claim, ask, respond, close, and publish result on a device. | US-06, FR-16 | Partial: screens built; action rules pass `staff see only the actions valid for the state and their role in it`; device run in A-14 |
| T-33 | A resident account never sees the staff tabs; a staff account cannot open Form Laporan. | FR-16 | Pass: `residents and staff get separate tab sets`; the API also refuses a staff report (`test_report_validation`) |
| T-34 | Correcting a published result creates a new version; the owner reads the latest and the earlier one. | US-08, FR-09 | Pass (API): `test_correction_is_a_new_version_and_the_old_one_stays_readable`; screen in A-26 |
| T-35 | A FlowGanic area code maps to the right pilot area; an unmapped code is dropped, not guessed. | US-13 | Pass (fixture codes): `test_waste_recap_maps_codes_and_drops_unmapped_ones`; agreed codes pending (Q-03) |
| T-36 | The Laporan tab shows an update marker after a state change or a new result. | FR-17 | Partial: `update markers compare against the last time Laporan was opened`; device check in A-14 |

T-22 (BMKG code mapping) applies only if the weather panel is built.

Also covered by passing tests without a scenario ID: wrong password and missing token return 401 (`test_health_and_login`); invalid fields, unknown facility, and future onset are rejected (`test_report_validation`); cancellation works only before review (`test_cancel_only_before_review`).

## Jest Unit Test Targets

- `ApiService.js`: success, 401 leading to sign-out, timeout, 5xx from the core, peer-down envelope from the integration service, idempotency key reused on retry.
- Form validation: empty complaint, future onset, missing area or facility.
- Mapping functions: report state to label, disposition to label, freshness to label, snapshot age.
- Role routing: resident and staff get their own tabs.

## Functional Test Table for the Report

Use this layout in the testing report PDF. Each row is run on the installed APK against the deployed services.

| No | Feature | Steps | Test data | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Login | Open Masuk, enter account, submit | `warga1` | Resident tabs appear | | |
| 2 | Report form validation | Submit with an empty complaint | - | Error under the field; nothing sent | | |
| 3 | Peer API outage | Stop the Veriqu adapter, open Panduan | - | Unavailable message; app keeps working | | |

Rows cover every scenario above that touches the app, including the integration rows for both peers.

## Evidence

For each run, record the date, commit, device or environment, command or steps, and the result. A scenario is not passed because its test file exists; it is passed when the test ran and passed.

## Release Criteria

Every scenario that is not Stretch passes. The course artifacts in [COURSE_REQUIREMENTS.md](COURSE_REQUIREMENTS.md) exist. Any peer mock is named as a mock.
