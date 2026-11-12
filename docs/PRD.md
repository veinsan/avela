# Avela Product Requirements Document

**Status:** Approved for the coursework MVP on 12 November 2026. Goal targets are proposed (P-05 in [DECISIONS.md](DECISIONS.md)).

**Owner:** Riantama Putra. **Team:** Mishael Gilland, Riantama Putra.

**Updated:** 12 November 2026.

## 1. Problem Statement

During a wildfire-smoke (karhutla) episode, residents get an air-quality number and nothing else. The number does not say what to do, and when a cough or tight chest starts, the resident has to decide alone whether to travel to a clinic through the smoke. An unnecessary trip adds exposure. A delayed one can let a serious condition get worse. The gap is wider outside big cities, where facilities are farther away.

Staff who do receive a complaint see symptoms without the environmental context around them, and nobody sees how many residents in an area are reporting smoke-related complaints.

Avela connects these pieces in one loop: area smoke forecast, a symptom report that carries its exposure context, review by facility staff, onsite examination when needed, and an anonymous area signal that other services can use.

## 2. Goals

| ID | Outcome | Metric | Proposed target |
| --- | --- | --- | --- |
| G-01 | Residents read the area's smoke conditions correctly. | Five test users answer three questions on the Home screen: which area, forecast or measurement, how old. | At least 4 of 5 answer all three correctly. |
| G-02 | Residents can submit a complete symptom report. | Time for a first-time test user from opening the form to a submitted report. | 3 minutes or less; no invalid report accepted. |
| G-03 | Residents never mistake a submitted report for a reviewed one. | Copy audit of every report state on every screen. | Zero screens show review, monitoring, or a response time that did not happen. |
| G-04 | Staff review the right report with its context. | Mandatory scenarios in [TEST_PLAN.md](TEST_PLAN.md). | All pass. |
| G-05 | The coursework is fully evidenced. | Requirements C-01 to C-17 in [COURSE_REQUIREMENTS.md](COURSE_REQUIREMENTS.md). | All have evidence by 13 December. |
| G-06 | Other groups can use Avela's API easily. | Health checks from 29 November to grading; time to answer a peer's GitHub issue. | 95% of checks succeed; first reply within 24 hours. |

Fewer unnecessary trips and faster care are long-term hypotheses. A classroom demo with fictional data cannot measure them.

## 3. Target Users

- **Residents (primary):** adults in Pekanbaru and Palangka Raya during smoke episodes. In the coursework they are fictional accounts.
- **Facility staff (secondary):** reviewers at a facility that accepts Avela reports. In the coursework they are simulated accounts, labelled as such.
- **Peer groups:** other student teams that consume Avela's public API.
- **Project owner and team:** decide scope, secure two peer integrations, build, and present.
- **Coding agent:** builds from this document and [ARCHITECTURE.md](ARCHITECTURE.md).

## 4. User Stories

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| US-01 | As a resident, I want the smoke conditions for my area so that I know what is outside. | I pick an area from a list or the app picks the nearest pilot area from my location. The screen shows PM2.5 value, unit, valid time, source, the label "Prakiraan model", and the snapshot's age. A snapshot older than 2 hours is marked stale. With no snapshot, the screen says the data is unavailable and shows no value. |
| US-02 | As a resident, I want protection guidance so that I can prepare before going out. | Each guidance item shows its source. No item states a disease probability. |
| US-03 | As a resident, I want to report symptoms from home so that staff can review them. | The form validates complaint, onset, course, area, and facility. A successful submit returns a report ID and the state "Terkirim, belum ditinjau". Retrying the same submit does not create a second report. |
| US-05 | As a resident, I want to see whether someone has reviewed my report so that I do not wait on a false assumption. | The report shows its state and a timeline with each author's role and time. Emergency information opens without signing in and without submitting a report. |
| US-06 | As staff, I want to claim a report, ask for more information, and publish a response from my phone so that the resident knows the next step. | A staff account sees a Queue tab limited to its facility. Each action sends the report's current version; a stale version is rejected. The response records the reviewer and a disposition: self-care, remote follow-up, or onsite assessment. |
| US-07 | As a resident, I want facility information so that I can find where to go. | The list comes from a peer group's service and names that source. An unknown opening status is shown as unknown. When the peer is down, the screen says so and the rest of the app keeps working. |
| US-08 | As a resident, I want my examination result so that I can follow the instructions. | Only the owner sees a published result. It shows author, facility, and publication time. |
| US-09 | As a peer group, I want a documented API and a key so that I can use Avela's data in my app. | Swagger UI and an OpenAPI file are public. Each group gets its own key and a test account. A missing or wrong key returns 401. |
| US-10 | As staff, I want the area's smoke forecast around the time symptoms started so that I read the complaint in context. | Report detail shows mean and peak PM2.5 for the window from onset to submission, the source, and the label "Prakiraan wilayah, bukan dosis pribadi". When no snapshot covers the window, it says the context is unavailable and the report stays reviewable. |
| US-11 | As a peer group, I want anonymous counts of smoke-related reports per area so that my app can show where complaints are rising. | With a valid key, the endpoint returns daily counts for up to 30 days and totals per disposition. Counts from 1 to 4 are hidden. The payload has no complaint text, account, or facility. |
| US-12 | As a resident, I want to know whether others in my area are reporting complaints so that I take the conditions seriously. | Home shows the number of reports from the area in the last 7 days, or "Belum cukup data" when the count is hidden. |

US-04 (optional photo attachment) is a stretch item; see section 7.

## 5. Functional Requirements

| ID | Requirement | Stories | State on 12 Nov |
| --- | --- | --- | --- |
| FR-01 | Authenticate residents and staff; limit staff to their facility. | US-03, US-06, US-08 | Core API built and tested |
| FR-02 | Serve the latest PM2.5 snapshot per area with unit, valid time, source, and age. | US-01 | Planned |
| FR-03 | Serve guidance with sources and separate emergency information. | US-02, US-05 | Planned |
| FR-04 | Persist symptom reports and append-only updates. | US-03 | Core API built and tested |
| FR-06 | Staff queue, claim, information request, response with disposition, close. | US-06 | Core API built and tested; screens planned |
| FR-07 | Show report state and timeline to the resident. | US-05 | Core API built; screens planned |
| FR-08 | Show facilities from a peer service with honest availability. | US-07 | Planned |
| FR-09 | Publish examination results to the report's owner. | US-08 | Core API built and tested; screen planned |
| FR-10 | Use the services of at least two other groups in visible features. | US-07 | Planned; groups not chosen (Q-03) |
| FR-11 | Publish an API with documentation, per-group keys, and a test account. | US-09 | Planned |
| FR-12 | Handle loading, empty, stale, unavailable, and retry states on every data screen. | All | Planned |
| FR-13 | Freeze an exposure context onto each report at submission. | US-10 | Planned |
| FR-14 | Publish the area health signal with small-count suppression. | US-11, US-12 | Planned |
| FR-15 | Accept PM2.5 snapshots pushed by the integration service. | US-01, US-10 | Planned |
| FR-16 | Show staff screens only to staff accounts in the same app. | US-06 | Planned |

FR-05 (attachments) is a stretch item. Push notifications, booking, pharmacy orders, and video consultation are not part of the product.

## 6. Non-Functional Requirements

| ID | Requirement | How to verify |
| --- | --- | --- |
| NFR-01 | No resident reads another resident's report or result. Staff read only their facility's reports. Unauthorized reads return 404. | Negative tests with two residents and two facilities (passing in `services/core/tests`) |
| NFR-02 | All personal and clinical data is synthetic. Secrets stay in `.env`. | Fixture and repository inspection |
| NFR-03 | STB containers run within limits: core 256 MB and 0.5 CPU; gateway and tunnel 64 MB and 0.25 CPU each. The core makes no outbound provider calls. | Compose file; `docker stats` on the STB |
| NFR-04 | A peer or provider failure never crashes the app or blocks reports and results. | Fault injection: timeout, 429, malformed body, outage |
| NFR-05 | The integration service gives up on an upstream call after 10 seconds and answers with cached data marked stale, or with an unavailable state. | Timeout tests |
| NFR-06 | Report creation is idempotent. State changes are version-checked. Every event records its author and time. | Duplicate-submit and stale-version tests (passing) |
| NFR-07 | Status is never conveyed by color alone. Text scales with the system setting. Touch targets are at least 48 by 48. | Device review; see [DESIGN.md](DESIGN.md) |
| NFR-08 | Public traffic uses HTTPS. The gateway allows 10 requests per second per client and 5 logins per minute. Sessions last 12 hours. | Deployment tests; `infra/stb/nginx.conf` |
| NFR-09 | No screen promises a diagnosis, a response time, or continuous monitoring. | Copy audit (G-03) |
| NFR-10 | The area health signal never exposes a count from 1 to 4, free text, an account, or a facility. | Suppression test |

Read latency and peer-key quotas are set after the first STB measurement (A-04, A-13).

## 7. Scope

**In scope**

- Two pilot areas with pushed PM2.5 snapshots and a referenced category.
- Guidance with sources and an emergency screen that needs no account.
- Symptom report with exposure context, timeline, clarification, and cancellation.
- Staff queue, review, response, and examination result in the same APK.
- Facility list from a peer service, and one more feature from a second peer.
- Public API: areas, smoke advisory, area health signal, facility review status.
- Core on the STB, integration service off the STB, release APK, and all course artifacts.

**Stretch, only after M3 passes**

- US-04 / FR-05 photo attachments (A-11).
- Custom PM2.5 forecast model with a baseline comparison (R-01).
- BMKG weather panel if the area codes are verified.

**Out of scope**

Diagnosis or prescribing by software; emergency dispatch; real patient data or hospital record exchange; evacuation orders and route safety; shelter and logistics; billing; a staff web console; geocoding search; nationwide coverage; 3D visuals; a multi-agent LLM pipeline.

**Changes**

| Date | Change |
| --- | --- |
| 2026-11-12 | Scope approved. Added exposure context (US-10), area health signal (US-11, US-12), in-app staff screens, and two pilot areas. Attachments and custom forecasting moved to stretch. Geocoding removed. |

Change scope here first, then update ARCHITECTURE, TEST_PLAN, and TODO in the same change.
