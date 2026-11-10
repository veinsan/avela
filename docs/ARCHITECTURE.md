# Architecture and Implementation Plan

**Status:** Proposed; no runtime exists. Scope comes from [PRD.md](PRD.md), with approvals tracked in [DECISIONS.md](DECISIONS.md).

## Technical Stack

| Area | Choice / candidate | Status and rationale |
| --- | --- | --- |
| Resident app | React Native + Expo | Assignment requirement; Android APK via EAS |
| App language | TypeScript, strict mode | Proposed for typed contracts; preserve required ApiService.js boundary if course requires literal filename |
| Core backend | FastAPI/Python | Proposed for explicit validation and potential data-tool compatibility; no version selected |
| Database | SQLite on persistent STB volume | Proposed for low-complexity single-instance demo; verify concurrency and backup behavior |
| Alternative backend | Express/TypeScript or PocketBase | Valid if team familiarity and domain/auth constraints favor it; not rejected |
| Integration layer | Separate small service outside STB | Proposed; server/laptop/VM hosting to be selected |
| Staff interface | Role-gated mobile screens or separate web console | Pending workflow and workload choice |
| Gateway / public access | Nginx + Cloudflare Tunnel | Course deployment pattern; class domain pending |
| Environmental API | Open-Meteo Air Quality adapter | Recommended after two public probes; provider forecasts, no custom model claim |
| Place search / weather | Open-Meteo Geocoding and optional BMKG adapter | Recommended; separate ID namespaces and reviewed administrative mapping |
| Station observations | OpenAQ v3 | Optional; API key and local observation coverage pending |
| Mapping | Peer directory; optional reviewed OSM import; tile/library choice pending | List works without map; shared Overpass instances are not the production backend |
| Testing | Jest for mobile; backend runner after stack selection | Jest required by coursework; backend choice pending |
| AI | None required for first vertical slice | Optional off-STB summarization or forecast experiment only after justification |
| Package manager / versions | Pending | Verify supported combinations when scaffolding is authorized |

## System Structure

```text
Resident Expo app -----> Avela core API on STB -----> Core database
Staff interface ------->        |
                                +-- report/review/result authorization

Resident app ----------> Integration service outside STB
                                |-- Avela core API as needed
                                |-- Peer group A service
                                |-- Peer group B service
                                +-- Public environmental provider

Optional research/model worker outside STB ---> versioned forecast artifacts
```

Public STB access goes through the gateway and tunnel. Do not expose the database to the internet. Core containers have CPU/memory limits and restart policies. Integration and any model computation run outside STB. The coursework prohibits frontend hosting and mobile builds on the STB.

The mobile app may read/write its own core API directly and call the integration layer for composite views. Provider and peer secrets belong in server-side configuration. No server credential is bundled in an APK. If integration handling is placed in mobile instead, use only endpoints and credentials explicitly designed for public clients.

## Component Responsibilities

- **Core API:** authentication, ownership, case lifecycle, staff review, versioned results, audit trail, and scoped peer API access.
- **Integration service:** provider calls, schema translation, bounded timeouts, caching, and two peer-service adapters. It must enforce identity propagation rather than trusting caller-supplied resident IDs.
- **Environmental adapter:** preserve units, valid times, retrieved times, spatial resolution, and provenance. Category mapping is a versioned reviewed configuration.
- **Staff surface:** read assigned queue, request information, publish follow-up, and publish simulated results. Explicit demo and availability labels.
- **Research worker:** if approved, train/evaluate outside STB and publish documented artifacts; no synchronous heavy processing in the report path.

Provider selection is detailed in DATA_SOURCES, with request evidence in API_RESEARCH. All public-provider orchestration remains outside STB. Use shared area-based fetches, provider-specific quotas and permissions, and separate valid/retrieval/issue timestamps. A geography identifier is not a universal identifier: GeoNames results need an explicit crosswalk before BMKG lookup. Facility location, clinical availability, and map tiles are independent sources.

## Planned Repository Layout

```text
apps/mobile/          Resident app; optional role-gated staff screens
apps/operator/        Only if a separate operator web interface is approved
services/core/        Domain API and migrations
services/integration/ Peer and public-provider adapters
infra/stb/            Compose, gateway, and tunnel configuration
contracts/            OpenAPI, peer contracts, example synthetic payloads
tests/                Cross-service scenarios if needed
docs/                 Existing documentation
```

These paths are planned only. Avoid creating the optional operator folder until selected.

## Data and Security Design

Use UTC ISO-8601 transport timestamps and local time labels in the UI. Store source valid time separately from fetch time. Derive owner identity from authentication. Keep writes transactional and idempotent. Enforce optimistic concurrency for staff state changes. Attachments, if approved, use private storage with size/type checks and authenticated retrieval.

SQLite is a proposal, not a claim of production capacity. A realistic STB check must cover ARM compatibility, available RAM/disk, concurrent writes, persistent volumes, and backup restoration. If it fails, choose an alternative with evidence; do not silently increase platform complexity.

## Failure and Recovery

Environmental data can degrade to a clearly dated cache or unavailable state. Core case creation must fail honestly if persistence fails. Local drafts do not imply delivery and must be isolated by account. Provider failure should not block access to published results. Avoid indefinite retry loops; idempotent retries and bounded backoff are required for recoverable writes.

Backups and migration rollback procedures are required before sustained deployment. Retention, recovery objectives, and local sensitive-cache policy are pending decisions. Demo logs should contain request IDs and error codes rather than health narratives.

## Implementation Plan

| ID | Step | Depends on | Completion criteria |
| --- | --- | --- | --- |
| A-00 | Establish documentation baseline | None | Required artifacts exist, links resolve, status is honest, validation recorded. |
| A-19 | Refine API selection and design specification | A-00 | Official-source shortlist and bounded probe evidence recorded; DESIGN refined using Impeccable; links, tokens, contrast, and draft status checked. |
| A-01 | Select preliminary workflow and demo boundary | A-00 | Owner selects primary flow, candidate pilot, and simulated staffing plan for feasibility work; this is not final scope freeze. |
| A-02 | Audit environmental data | A-00 | Pilot sample, timestamps, units, access terms, failures, and coverage documented. |
| A-03 | Agree peer integrations | A-00 | Two named groups, written contracts, samples, feature mapping, and mock policy. |
| A-04 | Validate stack and STB | A-01 | Architecture, resource limits, ARM support, package manager, and versions chosen. |
| A-16 | Prepare and submit the DDD milestone | A-01; peer context information from A-03 | Cover, required paragraphs, and subdomain diagram complete by end of Week 13; any unfinished peer contract is explicitly identified. |
| A-17 | Approve final MVP scope and implementation readiness | A-01, A-02, A-03, A-04 | DECISIONS freeze criteria met; clinical/demo boundary and conditional attachments/model work resolved; owner approves scope. |
| A-05 | Scaffold app and core contract | A-17 | Minimal app navigation and health endpoint run; actual commands documented. |
| A-06 | Implement identity and ownership | A-05 | Login and two-resident/two-facility negative access tests pass. |
| A-07 | Implement environmental context | A-02, A-05 | Fresh/stale/unavailable/forecast states pass with provenance. |
| A-08 | Implement symptom reports | A-06 | Validated persisted report, idempotent retry, and owner-only retrieval pass. |
| A-09 | Implement staff review | A-08 | State transitions, clarification, authorship, and concurrency checks pass. |
| A-10 | Implement facility and result flow | A-03, A-09 | Two peer services used meaningfully; correct-account result delivery verified. |
| A-11 | Implement optional attachments | A-08; Q-07 resolved | Private access, bounded uploads, deletion policy, and failure cases pass. |
| A-12 | Review guidance and failure UX | A-07, A-09 | Content provenance, emergency bypass, and unavailable staff states reviewed. |
| A-13 | Deploy public core on STB | A-06, A-08 | HTTPS, limits, persistent storage, restart, rate limit, backup/restore evidenced. |
| A-18 | Publish Registry and peer-access milestone | A-13 | Public URL, usable documentation, peer access instructions, and Registry entry complete by end of Week 14. |
| A-14 | Release and test Android APK | A-10, A-12, A-13 | Installed APK passes critical device and integration scenarios. |
| A-15 | Assemble final submission evidence | A-14, A-16, A-18 | Previously submitted DDD paper, README formats, testing report, registry, video, and URLs included in final package. |
| R-01 | Evaluate optional prediction model | A-02; Q-05 resolved | Independent holdout and baseline results justify inclusion or rejection. |

Work can overlap where dependencies permit, but no project implementation is currently authorized by this documentation-only request. The same task IDs appear in TODO.

The DDD paper is an early milestone, not work deferred until APK completion. Target A-16 by 22 November and A-13/A-18 by 29 November. Complete A-14/A-15 by 13 December. A-01 chooses a direction for feasibility; A-17 is the final scope gate after evidence and stack review. These are course-aligned planning targets, not demonstrated delivery commitments.
