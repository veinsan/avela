# Domain Model

**Updated:** 19 November 2026. This is the English working model of the submitted DDD paper, [Makalah_DDD.docx](Makalah_DDD.docx). The paper is the source of truth (D-22): when this file disagrees with it, fix this file. "Built" means the table and rules exist in `services/core`.

## Domain and Core

Domain: resident health services during wildfire-smoke (karhutla) episodes.

Core subdomain: **care-episode coordination** (Koordinasi Episode Layanan). It connects a resident's symptom report, with its exposure context, to an accountable staff review. This is what Avela builds itself and what a public air-quality API cannot provide: report ownership, state transitions, reviewer authority, clarification cycles, and correct delivery of results. Avela keeps its value even if the environmental data source is replaced.

## Ubiquitous Language

| Term | Indonesian | Meaning |
| --- | --- | --- |
| Area | Wilayah | One of the two pilot areas, Pekanbaru and Palangka Raya, picked from a list |
| Area snapshot | Potret lingkungan | The hourly PM2.5 forecast for an area, with value, unit, valid time, retrieval time, source, and freshness |
| Smoke advisory | Peringatan asap | The latest snapshot for an area with its category and age |
| Symptom report | Laporan | A resident's complaint, onset, course, and relevant history. Only the owner and the target facility's staff can read it |
| Exposure context | Konteks paparan | Mean and peak forecast PM2.5 for the report's area from onset to submission; an area value, never a personal dose |
| Care episode | Episode layanan | A report with its events, staff response, and examination result |
| Staff response | Tanggapan petugas | A published instruction from the reviewer, with a disposition |
| Disposition | Jenis tanggapan | Self-care monitoring, remote follow-up, or onsite examination |
| Examination result | Hasil pemeriksaan | A staff-authored, versioned record of an onsite examination, linked to the resident's account |
| Area health signal | Sinyal kesehatan wilayah | Counts of reports per area and day with small counts hidden |
| Facility directory | Direktori fasilitas | Avela's simulated list of facilities with services and opening schedule |
| Protective product | Produk pelindung | A product from Veriqu's catalogue, with its rating summary, recommended inside guidance |
| Waste recap | Rekap sampah terkelola | FlowGanic's managed waste volume per area and waste type |
| Update marker | Penanda pembaruan | An in-app marker that a report changed state or a result was published |
| Peer key | Kunci API | An API key issued to one other group, limited by scope |

## Bounded Contexts

| Context | Type | Responsibility | Where it runs | State |
| --- | --- | --- | --- | --- |
| Care Coordination (Koordinasi Layanan) | Core | Reports with exposure context, review queue, clarification requests, staff responses, state transitions | Core, `care.py`; exposure computed in `environment.py` | Built |
| Examination Results (Hasil Pemeriksaan) | Supporting | Versioned onsite examination records linked to the right resident account | Core, `results.py` | Built |
| Area Health Signal (Sinyal Kesehatan Wilayah) | Supporting | Reads reports from Care Coordination and produces only counts per area and day, with small counts hidden | Core, `signal.py` | Built |
| Environment (Lingkungan) | Supporting | Normalizes Open-Meteo forecasts, optionally with BMKG local weather, into area snapshots; shows FlowGanic's waste recap. Never receives a resident's identity or symptom history | Integration service; snapshots stored in the core, `environment.py` | Snapshot storage and advisory built; integration service planned |
| Health Guidance (Panduan Kesehatan) | Supporting | Versioned protection content with source and review status; Veriqu product recommendations | Core, `guidance.py`; products through the integration service | Guidance and emergency contacts built; products planned (A-10) |
| Facility Directory (Direktori Fasilitas) | Supporting | Simulated facilities with services and opening schedule | Core, `facilities.py` | Built |
| Identity and Access (Identitas dan Akses) | Generic | Authentication, resident and staff roles, staff facility membership, API keys for other groups | Core, `security.py`, `keys.py` | Built |
| Notifications (Notifikasi) | Generic | Update markers when a report changes state or a result is published | Derived from core events; shown in the app | Planned |
| Product Catalogue (Katalog Produk) | Peer, Veriqu | Products with rating summaries | Veriqu, through an adapter in the integration service | Contract pending (Q-03) |
| Waste Distribution Coordination (Koordinasi Distribusi Sampah) | Peer, FlowGanic | Managed waste volume per area and waste type | FlowGanic, through an adapter in the integration service | Contract pending (Q-03) |

Avela's own contexts are modules of one core microservice, except Environment, which runs in the integration service. They are split into separate containers only if deployment forces it.

## Context Map

This is the table in section B of the paper.

| Upstream | Downstream | Pattern | What flows |
| --- | --- | --- | --- |
| Identity and Access | Care Coordination, Examination Results | Customer-supplier | Identity, role, facility membership |
| Care Coordination | Examination Results | Customer-supplier | Link from the report to the examination |
| Environment | Care Coordination | Customer-supplier | PM2.5 snapshot for the report's exposure context |
| Care Coordination | Area Health Signal | Customer-supplier | Report counts per area, day, and disposition |
| Care Coordination, Examination Results | Notifications | Published events | State changes and published results |
| Open-Meteo and BMKG | Environment | Conformist | PM2.5 forecast and local weather |
| Product Catalogue (Veriqu) | Health Guidance | Anticorruption layer | Protective products with rating summaries |
| Waste Distribution Coordination (FlowGanic) | Environment | Anticorruption layer | Managed waste volume per area and waste type |
| Environment, Area Health Signal, Health Guidance | Other groups | Open host service | Smoke advisory, area signal, non-sensitive guidance |

The anticorruption layers translate each peer's model into Avela's terms. FlowGanic's areas (RW or kelurahan) map to Avela's pilot areas through an agreed area code. A peer schema change breaks only its adapter, never the core.

## Subdomain Decomposition

This is section C of the paper.

| Subdomain | Type | Sub-subdomains or content | Built by |
| --- | --- | --- | --- |
| Care-episode coordination | Core | Symptom reporting with exposure context; review and clarification; staff response publication | Avela, in the core |
| Onsite examination results | Supporting | Linking the patient to the account; versioned result publication | Avela, in the core |
| Area health signal | Supporting | Anonymous aggregation of reports per area | Avela, in the core |
| Environment and health guidance | Supporting | Open-Meteo forecast, BMKG weather when available, FlowGanic waste recap, Veriqu protective products, versioned guidance | Avela, with public providers and peers |
| Facility directory | Supporting | Simulated facility list, since no real facility is a partner (D-11) | Avela, in the core |
| Identity and access | Generic | Token authentication, server-set roles, separate peer keys | Standard pattern |
| In-app notifications | Generic | Update markers; no external messaging service | Standard pattern |
| Pilot-area catalogue | Generic | The pilot areas with coordinates; no location search | Seed data |

## Entities and Invariants

| Entity | Key fields | Invariants | State |
| --- | --- | --- | --- |
| Account | ID, username, role, display name | The role is set on the server. | Built |
| Membership | account, facility | Required to read or act on a facility's reports. Only active staff of the facility respond. | Built |
| Facility | ID, name, area, services, schedule | A report can only target an existing facility in its area. An unknown schedule stays unknown. | Built |
| SymptomReport | ID, owner, facility, area, complaint, onset, course, history, state, version | Owner never changes. Creation is idempotent per owner and key. State changes are version-checked. | Built |
| ExposureContext (value) | window, mean, peak, point count, source, retrieved time | Frozen at submission. Null with a reason when no snapshot covers the window. | Built |
| ReportEvent | report, author, kind, text, disposition, time | Append-only. Written in the same transaction as the state change. | Built |
| ExaminationResult | owner, report, facility, author, content, status, version | Owner comes from the report, never from the request. Created only after a response. A draft is hidden from the owner. A correction is a new version; earlier versions are kept. | Built |
| Area | ID, name, province, coordinates | Fixed list of pilot areas. FlowGanic codes map to it in the integration service. | Built |
| AreaSnapshot | area, points, unit, source, retrieved time | Valid time and retrieval time are separate. Only the integration service's key can write it. | Built |
| ApiKey | label, key hash, scopes | The plain key is shown once. A key reads only what its scope allows. Revoking deletes it. | Built |

## Report States

`submitted` -> `in_review` -> `awaiting_information` -> `in_review` -> `responded` -> `closed`, and `submitted` -> `cancelled`. The table with actors is in [PRODUCT_FLOWS.md](PRODUCT_FLOWS.md); the code is `transition()` in `services/core/app/care.py`.

## Business Rules

1. A submitted report is not a reviewed report. Only a published staff response moves it to `responded`.
2. Only the staff member who claimed a report can ask for information, respond, or close it.
3. A retry with the same idempotency key and the same payload returns the first report. A different payload under that key is rejected.
4. A new complaint after `closed` or `cancelled` is a new report.
5. A missing snapshot never blocks a report.
6. The area health signal counts reports by area and day, leaves out cancelled reports, and hides counts from 1 to 4 (D-30).
7. A peer key never reads reports, identities, or results.
8. A peer outage shows an unavailable state. Reports and existing results keep working.
9. A correction to a published result is stored as a new version.

## Transaction Boundaries

Creating a report, freezing its exposure context, and writing its first event are one transaction. Publishing a response and moving the report to `responded` are one transaction. A snapshot push is its own transaction and never waits on a report write.
