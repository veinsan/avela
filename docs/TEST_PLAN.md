# Verification and Evaluation Plan

**Status:** Planned tests. No application exists and no application test has been run.

## Layers

1. Unit tests for domain transitions, schema validation, freshness logic, and adapter normalization.
2. API integration tests for persistence, authentication, role scope, idempotency, and result linkage.
3. Peer contract tests for schema agreement and failure behavior.
4. End-to-end tests on an installed Android release build, including a staff review scenario.
5. Manual usability and content review with explicit distinction between simulated and actual professional feedback.

Jest is required for the mobile course deliverable. Backend and end-to-end tools remain pending stack selection. Record actual commands only after they exist.

## Mandatory Acceptance Scenarios

| ID | Related requirement | Scenario and expected result |
| --- | --- | --- |
| T-01 | US-01, FR-02 | Location denied: manual area selection works. |
| T-02 | US-01, NFR-04 | Provider timeout: dated stale cache or unavailable state; no fabricated current value. |
| T-03 | FR-02 | Forecast has source, unit, valid time, issue time if available, and resolution note. |
| T-04 | FR-03, NFR-09 | Emergency-access guidance reachable without submitting a report; no queue prerequisite. |
| T-05 | US-03, FR-04 | Valid report survives restart and is visible only to its owner/permitted staff. |
| T-06 | NFR-06 | Network retry creates one report; conflicting idempotency-key payload is rejected. |
| T-07 | NFR-01 | Resident A cannot read/write Resident B's report, result, or attachment. |
| T-08 | NFR-01 | Staff of Facility A cannot access Facility B's queue or publish its results. |
| T-09 | FR-06 | Two reviewers claim/change the same version: only a valid transition succeeds. |
| T-10 | FR-06, FR-07 | Clarification request and resident reply preserve authorship and history. |
| T-11 | US-05 | Submission acknowledgment never appears as a clinician response; unavailable staff is explicit. |
| T-12 | FR-09 | Published result is delivered to verified patient linkage; duplicate import does not duplicate result. |
| T-13 | FR-05 | Optional upload fails or is omitted: report remains usable; unauthorized retrieval fails. |
| T-14 | FR-10 | Two distinct peer groups supply meaningful features with recorded requests and user-visible use. |
| T-15 | NFR-04 | Peer timeout/429/malformed payload produces clear degradation without app crash. |
| T-16 | NFR-03 | STB restart preserves database; CPU/memory limits present; AI/integration not hosted on STB. |
| T-17 | NFR-08 | Public HTTPS works, rate limits apply, secrets absent from bundle and repository. |
| T-18 | NFR-07 | Large text, non-color status, form errors, and map-list alternative reviewed on Android. |
| T-19 | Course | Release APK installed; login, four-plus screens, stack/tab navigation, validated form demonstrated. |
| T-20 | NFR-02 | Fixtures, uploads, logs, screenshots, and video contain synthetic patient data only. |

## Evidence Record

For each run record date, commit/worktree state, environment/device, test command or manual steps, expected/actual outcome, redacted evidence path, and known limitations. Do not mark a scenario passed merely because its test file exists. Avoid tests that only mirror implementation details.

## Product Evaluation

Use synthetic task walkthroughs to test whether a resident understands data freshness, submits a report, identifies its review status, and finds a published response. Measure task completion, confusion points, and time. Set numerical targets after a pilot instead of inventing them.

Staff review should assess report completeness and usefulness. Actual clinical appropriateness requires a qualified reviewer and a suitable evaluation design; a teammate playing a clinician proves UI flow only. Compare a proposed AI summary with the original report for omissions and unsupported additions before deciding whether it adds value.

## Optional Forecast Evaluation

If R-01 is approved, use independent observations, temporal holdout, and suitable spatial holdout. Compare against persistence or a documented provider forecast using MAE/RMSE and breakdowns by station/time period. Validate interval coverage if uncertainty is displayed. Record missing-data handling, baseline parity, and leakage checks. Prediction errors do not establish clinical benefit or wildfire-source attribution.

## Release Criteria

All applicable mandatory scenarios pass; course deliverables exist; failure states are demonstrated; no unsupported clinician/partner claims remain; outstanding risks are documented. Skipping optional AI does not block a working product. Missing two-peer integration, an APK, or correct authorization does block the corresponding completion claim.
