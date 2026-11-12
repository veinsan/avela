# Domain Model

**Updated:** 12 November 2026. This is the English working model behind [MAKALAH_DDD.md](MAKALAH_DDD.md). "Built" means the table and rules exist in `services/core`.

## Domain and Core

Domain: resident health support during wildfire-smoke episodes.

Core subdomain: **care-episode coordination**. It connects a resident's symptom report, with its exposure context, to an accountable staff review and follow-up. This is what Avela builds itself and what a public air-quality API cannot provide: report ownership, state transitions, reviewer responsibility, clarification cycles, and correct delivery of results.

## Ubiquitous Language

| Term | Meaning |
| --- | --- |
| Area | One of the pilot areas a resident reports from |
| Area snapshot | The hourly PM2.5 forecast for an area, with source, valid times, and retrieval time |
| Smoke advisory | The latest snapshot for an area with its category and age |
| Symptom report | A resident's account of a complaint, its onset, and its course |
| Exposure context | Mean and peak forecast PM2.5 for the report's area from onset to submission; an area value, never a personal dose |
| Care episode | A report with its events, staff response, and examination result |
| Staff response | A published instruction from the reviewer, with a disposition |
| Disposition | Self-care, remote follow-up, or onsite assessment |
| Examination result | A staff-authored record of an onsite examination, linked to a report |
| Area health signal | Daily counts of reports per area with small counts hidden |
| Peer key | An API key issued to one other group, limited by scope |

## Bounded Contexts

| Context | Type | Responsibility | Where it runs | State |
| --- | --- | --- | --- | --- |
| Care Coordination | Core | Reports, exposure context, review queue, transitions, responses | Core, `care.py` | Built, except exposure context |
| Examination Results | Supporting | Draft and published results linked to a report's owner | Core, `results.py` | Built |
| Area Health Signal | Supporting | Anonymous aggregate of reports per area | Core | Planned |
| Environmental Context | Supporting | Fetch and normalize PM2.5 forecasts; push snapshots | Integration service; snapshots stored in the core | Planned |
| Health Guidance | Supporting | Versioned guidance items with sources | Core | Planned |
| Facility Directory | Supporting, peer-owned | Facility list, services, opening hours | Peer group A, through an adapter | Planned |
| Second peer context | Supporting, peer-owned | Decided with the group chosen in Q-03 | Peer group B, through an adapter | Planned |
| Identity and Access | Generic | Login, roles, facility membership, peer keys | Core, `security.py` | Built, except peer keys |
| Notifications | Generic | Unread markers in the app | App | Planned |

The contexts are modules of one core microservice. They are split into separate containers only if deployment forces it.

## Context Map

| Upstream | Downstream | Pattern | What flows |
| --- | --- | --- | --- |
| Identity and Access | Care Coordination, Examination Results | Customer-supplier | Account, role, facility membership |
| Care Coordination | Examination Results | Customer-supplier | The responded report and its owner |
| Environmental Context | Care Coordination | Customer-supplier | Area snapshot copied into the exposure context |
| Care Coordination | Area Health Signal | Published read model | Report counts by area, day, and disposition |
| Open-Meteo | Environmental Context | Conformist | PM2.5 forecast |
| Peer group A | Facility Directory adapter | Anticorruption layer | Facilities, services, hours |
| Peer group B | Its adapter | Anticorruption layer | Decided with Q-03 |
| Area Health Signal, smoke advisory, Health Guidance | Other groups | Open host service | Non-sensitive area data |

## Entities and Invariants

| Entity | Key fields | Invariants | State |
| --- | --- | --- | --- |
| Account | ID, username, role, display name | The role is set on the server. | Built |
| Membership | account, facility | Required to read or act on a facility's reports. | Built |
| Facility | ID, name, area | A report can only target an existing facility. | Built; area link planned |
| SymptomReport | ID, owner, facility, area, complaint, onset, course, state, version | Owner never changes. Creation is idempotent per owner and key. State changes are version-checked. | Built; area planned |
| ExposureContext (value) | window, mean, peak, point count, source, retrieved time | Frozen at submission. Null with a reason when no snapshot covers the window. | Planned |
| ReportEvent | report, author, kind, text, disposition, time | Append-only. Written in the same transaction as the state change. | Built |
| ExaminationResult | owner, report, facility, author, content, status | Owner comes from the report, never from the request. Created only after a response. A draft is hidden from the owner. | Built |
| Area | ID, name, province, coordinates | Fixed list of pilot areas. | Planned |
| AreaSnapshot | area, points, unit, source, retrieved time | Valid time and retrieval time are separate. Only the integration service's key can write it. | Planned |
| ApiKey | group, key hash, scopes, active | The plain key is shown once. A key reads only what its scope allows. | Planned |

## Report States

`submitted` -> `in_review` -> `awaiting_information` -> `in_review` -> `responded` -> `closed`, and `submitted` -> `cancelled`. The table with actors is in [PRODUCT_FLOWS.md](PRODUCT_FLOWS.md); the code is `transition()` in `services/core/app/care.py`.

## Business Rules

1. A submitted report is not a reviewed report. Only a published staff response moves it to `responded`.
2. Only the staff member who claimed a report can ask for information, respond, or close it.
3. A retry with the same idempotency key and the same payload returns the first report. A different payload under that key is rejected.
4. A new complaint after `closed` or `cancelled` is a new report.
5. A missing snapshot never blocks a report.
6. The area health signal counts reports by area and day, leaves out cancelled reports, and hides counts from 1 to 4.
7. A peer key never reads reports, accounts, or results.

## Transaction Boundaries

Creating a report, freezing its exposure context, and writing its first event are one transaction. Publishing a response and moving the report to `responded` are one transaction. A snapshot push is its own transaction and never waits on a report write.
