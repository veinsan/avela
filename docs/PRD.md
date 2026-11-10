# Avela Product Requirements Document

**Status:** Draft for scope review, not an approved implementation specification.

**Owner:** Project owner; two student implementers, names and role assignment pending.

**Updated:** 10 November 2026.

**Sources:** [REFERENCES.md](REFERENCES.md). Decision status is maintained in [DECISIONS.md](DECISIONS.md).

## 1. Problem Statement

Residents in areas affected by wildfire smoke may have environmental information without a clear path from that information to protective action or professional help. Traveling for every concern may be undesirable during a smoke episode, but delayed assessment can also be harmful. Avela explores how to connect environmental awareness, symptom reporting, professional review, and onsite follow-up.

The user wants two connected phases: before exposure, understand outdoor conditions and prepare; after exposure or symptoms, understand the next step and access care. The user has proposed both receiving results after onsite assessment and submitting symptoms from home for staff review. A remote-first pathway with onsite escalation is the current assistant recommendation, not a confirmed clinical service arrangement.

No demand interviews, local dataset audit, staffing agreement, or clinical validation has been completed. Orange skies, photographs, hotspot proximity, and coarse model forecasts must not be treated as measurements of an individual's lung condition.

## 2. Goals

| ID | Intended outcome | Evaluation method | Target status |
| --- | --- | --- | --- |
| G-01 | Residents understand environmental conditions and data limitations | Scenario-based comprehension questions | Numerical target pending usability pilot |
| G-02 | Residents submit an understandable symptom history | Completion, missing fields, and staff assessment of synthetic cases | Threshold pending form review |
| G-03 | Residents understand whether their report has been reviewed | Status comprehension and unavailable-service scenarios | No simulated case falsely claims staff review |
| G-04 | Staff can review and respond to the correct report | End-to-end synthetic case tests and authorization checks | All mandatory acceptance cases pass |
| G-05 | Coursework integration is demonstrable | APK, public core API, and two peer-service feature scenarios | All mandatory course requirements evidenced |
| G-06 | Optional prediction improves useful information | Independent temporal evaluation against a baseline | Research hypothesis; no model superiority claim yet |

Reduced unnecessary travel and faster access to appropriate care are long-term hypotheses. A classroom demo cannot establish improved health outcomes.

## 3. Target Users

- **Primary: residents** in a selected smoke-affected pilot area. Region, adult-only versus caregiver accounts, and accessibility needs require validation.
- **Secondary: healthcare staff** at a proposed partner facility who review reports and publish follow-up. No named hospital or puskesmas is a confirmed partner.
- **Supporting: facility operator** who maintains service availability and directory details. This is a proposed role, not a real staffed service.
- **Project owner and student team:** select scope, secure peer integrations, implement, and demonstrate the system.
- **Agent/developer:** works from this draft without converting proposals into approved scope.

For coursework, use fictional adult residents and simulated authorized staff. Caregiver/minor workflows require a separate decision before implementation.

## 4. User Stories

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| US-01 | As a resident, I want conditions for my selected area so that I understand the outdoor environment. | Displays pollutant, unit, valid time, source, data type, and freshness; denied location permission permits manual selection. |
| US-02 | As a resident, I want preparation guidance so that I can plan activity. | Guidance has a source and review status; no deterministic disease prediction or unsupported personal risk percentage. |
| US-03 | As a resident, I want to report symptoms from home so that staff can review my concern. | Validated report contains onset, course, complaint, and permitted context; submission returns a persisted identifier; retries do not duplicate it. |
| US-04 | As a resident, I want to add supporting information so that staff have context. | An optional attachment can be omitted; permitted types and size are explained; failed upload does not falsely mark the attachment saved. |
| US-05 | As a resident, I want to know whether someone has reviewed my report so that I do not confuse submission with monitoring. | Status and service availability are explicit; no invented response-time guarantee; emergency guidance is accessible without queue completion. |
| US-06 | As staff, I want to request more information or publish follow-up so that the resident knows the next step. | Facility-scoped authorization, version-checked transitions, reviewer attribution, and audit events are enforced server-side. |
| US-07 | As a resident, I want facility information so that I can find an appropriate service. | Shows available source details, last verification, and unknown availability honestly; map has a list alternative. |
| US-08 | As a resident, I want my examination results so that I can follow professional instructions. | Only results linked to my verified account are visible; published result includes author, facility, time, and revision status. |
| US-09 | As a peer team, I want a documented Avela API so that I can use its non-sensitive service in my application. | Contract, key, test account where relevant, errors, sample responses, and availability expectations are documented; patient reports are not shared through generic peer keys. |

## 5. Functional Requirements

All requirements below describe the proposed implementation; none are currently delivered.

| ID | Requirement | Priority / relation |
| --- | --- | --- |
| FR-01 | Support authenticated resident accounts and facility-scoped staff roles. | Proposed MVP; US-03 to US-08 |
| FR-02 | Retrieve normalized environmental context with timestamps, units, source, and resolution notes. | Proposed MVP; US-01 |
| FR-03 | Present sourced protection content and distinct emergency-access content. | Proposed MVP; US-02, US-05 |
| FR-04 | Persist a structured symptom report and append-only updates. | Proposed MVP; US-03 |
| FR-05 | Support optional private attachments after the upload design is validated. | Conditional MVP; US-04 |
| FR-06 | Provide staff queue, claim/review, information requests, and signed follow-up. | Proposed remote-first MVP; US-06 |
| FR-07 | Show report status, unread response indicators, and service availability. | Proposed MVP; US-05 |
| FR-08 | Discover relevant facilities with honest availability metadata. | Proposed MVP; US-07 |
| FR-09 | Publish simulated onsite results to the correct resident account. | Proposed MVP; US-08 |
| FR-10 | Consume at least two other student groups' APIs in meaningful user-visible features. | Course requirement; exact providers pending |
| FR-11 | Expose a useful, documented Avela API to peer groups. | Course requirement; US-09 |
| FR-12 | Implement loading, empty, stale, unavailable, offline, and retry behavior. | Course requirement and all journeys |

Push notifications, booking, pharmacy orders, video consultation, and continuous monitoring are not implied by these requirements. In-app status updates can demonstrate the initial follow-up journey.

## 6. Non-Functional Requirements

| ID | Requirement | How to verify |
| --- | --- | --- |
| NFR-01 | No cross-resident report, result, or attachment access; staff restricted to assigned facility. | Negative authorization tests across two residents and two facilities |
| NFR-02 | Use synthetic patient data for coursework; secrets remain outside tracked files. | Fixture and repository inspection |
| NFR-03 | Core service runs in Docker on STB with CPU and memory limits; no AI workload on STB. | Compose inspection and device resource observation |
| NFR-04 | Peer/provider failures do not crash navigation or erase reports. | Fault injection: timeout, 429, malformed response, and outage |
| NFR-05 | Bounded requests with explicit pending states; proposed integration deadline 10 seconds, configurable after provider audit. | Timeout tests; threshold is a design proposal |
| NFR-06 | Retry-sensitive writes are idempotent and published clinical responses are traceable. | Duplicate submission and audit-history tests |
| NFR-07 | Interface communicates status without color alone and supports text enlargement. | Device accessibility review; design details in DESIGN |
| NFR-08 | HTTPS public API, authenticated writes, bounded uploads, and rate limits. | Deployment and API tests |
| NFR-09 | No feature promises diagnosis, clinician availability, or continuous monitoring without the corresponding service. | Copy review and unavailable-service tests |

Capacity, latency, storage retention, backup recovery targets, and environmental freshness thresholds must be set from device/provider evidence before release. No load benchmark exists yet.

## 7. Scope

### Proposed In Scope

One pilot area; resident mobile app; staff review surface; environmental context; sourced guidance; symptom case management; facility discovery; simulated examination results; core STB service; two peer integrations; synthetic end-to-end demo; required course artifacts.

### Conditional Scope

Attachments depend on storage and access validation. Remote review depends on selection of the workflow and a clearly simulated staff role for the demo. A forecasting experiment depends on usable historical observations, access terms, and an evaluation plan. A separate operator web application depends on workload and deadline review.

### Out of Scope for the Initial Proposal

Autonomous diagnosis or prescribing; guaranteed emergency response; prediction of individual disease from air quality or a photograph; automated evacuation orders; safe-route guarantees; shelter logistics and food distribution; billing; real hospital record integration; real patient data; validated clinical deployment; nationwide rollout; source attribution; methane-centered health scoring; complex atmospheric simulation; 3D digital twins; a mandatory multi-agent LLM pipeline.

### Freeze and Change Control

The brand is confirmed. Product scope is not frozen. Resolve the critical decisions in DECISIONS before implementation. Update this document, architecture dependencies, tests, and TODO together when an approved scope change occurs.
