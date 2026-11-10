# Domain Model and DDD Notes

**Status:** Proposed model for discussion and the DDD assignment. Not a deployed schema or a submission-ready academic paper.

## Domain and Core Contribution

Domain: resident health support during wildfire-smoke episodes. Proposed core subdomain: **care-episode coordination**, connecting resident reports to accountable staff review and follow-up. Environmental data provides context; it is not a diagnosis engine.

This gives Avela domain behavior beyond API aggregation: report ownership, state transitions, review responsibility, clarification cycles, publication, and correct delivery of results. This core choice depends on approval of the remote-review workflow.

## Ubiquitous Language

| Term | Meaning |
| --- | --- |
| Environmental snapshot | Source-attributed observation or forecast for an area and time |
| Exposure context | Environmental information relevant to a reported place/time; not measured personal dose |
| Symptom report | Resident-authored account of complaints and history |
| Care episode | A report plus updates, staff review, and associated follow-up |
| Staff response | Authored, published instruction from an authorized reviewer; simulation labeled in demo |
| Examination result | Versioned record of an onsite encounter, not AI-generated diagnosis |
| Facility availability | Source-attributed operational information, not guaranteed capacity |
| Escalation | Direction toward appropriate timely care; not proof that care was received |

## Subdomains and Bounded Contexts

| Context | Classification | Responsibility | Ownership proposal |
| --- | --- | --- | --- |
| Care Coordination | Core | Reports, review queue, transitions, response publication | Avela STB service |
| Environmental Context | Supporting | Normalize pollutant data, source, timestamps, freshness | Off-STB integration adapter; persisted snapshots if needed |
| Facility Discovery | Supporting | Read facility directory and availability | Peer provider with Avela adapter |
| Clinical Encounter | Supporting / external context | Examination records and staff-authored results | Avela demo module or peer service; choose one owner |
| Health Guidance | Supporting | Versioned reviewed content and source attribution | Avela content records or contracted peer |
| Identity and Access | Generic | Authentication, ownership, facility membership, API keys | Avela service boundary |
| Notifications | Generic | In-app unread state; later optional delivery channels | Avela initially |

Logical bounded contexts do not require separate containers. Start with one core microservice and clear internal module boundaries. Split physical services only when justified by ownership or deployment constraints.

## Context Map

Environmental and peer services are upstream providers. Avela uses adapters to translate external contracts into its own domain terms. The mobile app consumes Avela and integration endpoints. Generic peer API keys grant explicit non-sensitive scopes; they are not clinical staff credentials.

Any result-importing peer must have an explicit facility/account linkage and trusted publisher identity. Authentication of a peer server does not by itself authorize publication to every resident.

## Proposed Entities and Invariants

| Entity | Key fields | Invariants |
| --- | --- | --- |
| Account | ID, role memberships, status | Roles are granted server-side; client cannot self-assign staff. |
| FacilityMembership | staff ID, facility ID, role, active | Required for reviewing that facility's reports. |
| SymptomReport | ID, owner ID, facility ID, onset, complaint, state, version | Owner immutable; submission idempotent; transitions validated. |
| ReportUpdate | ID, report ID, author ID, text, created time | Append-only; access follows parent report. |
| StaffResponse | report ID, reviewer ID, disposition, text, published time, revision | Published response requires active reviewer membership. |
| ExaminationResult | owner ID, encounter linkage, author, content, version | Correct account linkage established before publication. |
| Attachment | report ID, private object key, MIME type, size | No public permanent URL; access follows report ownership. |
| EnvironmentalSnapshot | location, value, unit, valid time, retrieved time, source, type | Retrieval time does not replace observation/forecast valid time. |
| GuidanceVersion | source, reviewed by, review status, effective date | Draft content cannot appear as clinically approved. |
| AuditEvent | actor, action, resource ID, time, request ID | No unnecessary symptom narrative or secrets in logs. |

## Transaction Boundaries

Creating a report and recording its initial state should be atomic. Publishing a staff response and transitioning the report to `responded` should be atomic. Environmental fetches and external notifications must not hold core database write transactions open. External result ingestion needs deduplication and version handling.

## Proposed Business Rules

1. An unavailable environmental provider does not prevent a resident from accessing an existing response.
2. Submission receipt is not staff review, emergency dispatch, or acceptance of clinical responsibility.
3. Only the assigned facility can access its review queue; generic administrators do not automatically need narrative health access.
4. A retry reuses the same idempotency key for the same payload; a different payload under that key is rejected.
5. A closed episode remains readable by its owner; new symptoms create a new episode rather than rewriting history.
6. Availability, forecast freshness, and clinical status are independently represented.

## DDD Submission Preparation

The course paper still needs its cover, author identities, requested paragraph counts, diagram, and selected peer contexts. Use this model as input after scope approval. Core/supporting/generic classification and context boundaries must match the final implementation rather than a hypothetical larger platform.
