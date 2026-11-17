# Decisions and Open Questions

**Updated:** 17 November 2026. Confirmed means the project owner said so or the assignment requires it. Proposed means the assistant recommends it and the owner has not objected or agreed yet.

## Confirmed

| ID | Decision | Basis | Consequence |
| --- | --- | --- | --- |
| D-01 | Product name is Avela. | Owner, 10 Nov | Use it for the app, repository, and Registry name. |
| D-02 | Project Markdown lives in `docs/`. Two root files are exceptions: `README.md` (repository front page) and `CLAUDE.md` (imports `docs/AGENTS.md`). | Owner, 10 Nov; exceptions approved 12 Nov | `project-setup/` is a local, git-ignored copy and is not part of the repository. |
| D-03 | Theme is Health & Wellbeing, in the wildfire-smoke (karhutla) context. | Owner, 10 Nov | Features serve health access, not fire detection. |
| D-04 | Residents are the primary users; facility staff support their journey. | Owner, 10 Nov | Resident screens come first in scope and design. |
| D-05 | Residents report symptoms, staff review them, and an onsite examination follows when needed. | Owner, 10 Nov | Photo attachments are a stretch item (P-03). |
| D-06 | The primary workflow is remote review first, with onsite follow-up. | Owner authorized the core build on 11 Nov; the DDD paper and code use it | `services/core` implements this state machine. |
| D-07 | React Native (Expo) APK, core microservice in Docker on the STB, and integration with at least two other groups. | Assignment | See [COURSE_REQUIREMENTS.md](COURSE_REQUIREMENTS.md). |
| D-08 | Core stack: Python 3.12, FastAPI, SQLite in WAL mode, PyJWT, uv, pytest. The integration service uses the same stack. | Owner, 11 Nov; `services/core/requirements.txt` | No second backend language. |
| D-09 | [DESIGN.md](DESIGN.md) tokens are the baseline for implementation. | Owner requested the refinement on 10 Nov | Change tokens there first, then the app theme. |
| D-10 | PM2.5 is the pollutant shown. Values come from a provider forecast. | Owner, 10 Nov | A custom forecast model is a stretch item (P-03). |
| D-11 | No real hospital or puskesmas is a partner. | Owner, 10 Nov | Facilities and staff are simulated and labelled in the app. |
| D-12 | The owner stages, commits, and pushes. The agent does so only when the owner asks in that message. | Project-setup rule; owner practice on 10 Nov | The agent ends each task with the Git commands to run. |
| D-13 | Open-Meteo Air Quality is the PM2.5 source. BMKG weather is optional. OpenAQ is not used in the MVP. | Evidence in [API_RESEARCH.md](API_RESEARCH.md) | Geocoding and device location are dropped: the resident picks a pilot area from a list (D-25). |
| D-14 | Pilot areas are Pekanbaru (primary) and Palangka Raya (secondary). | Owner, 12 Nov | Seed data, BMKG codes, and facility samples cover both. |
| D-15 | Staff use role-gated screens inside the same APK. | Owner, 12 Nov | No separate web console. |
| D-16 | Each symptom report stores an exposure context: the area's PM2.5 forecast around symptom onset, frozen at submission. | Owner, 12 Nov | Staff see symptoms next to environmental context. |
| D-17 | The core publishes an area health signal to other groups: anonymous report counts per area. | Owner, 12 Nov | This is Avela's main offering in the API Registry. |
| D-18 | Class K01. Public core URL `https://avela.stei.fun`; integration service `https://avela-int.stei.fun`; tunnel name `k01-avela`. | Owner, 12 Nov; deck slides 12-13 | The Registry name `avela` still has to be reserved (A-22). |
| D-19 | Team: Mishael Gilland (18224005) and Riantama Putra (18224061). Riantama does the backend, integration, and mobile work. Mishael helps redesign the front end. | DDD paper cover; owner, 17 Nov | Mishael's commits come from the redesign; both present in the video. |
| D-20 | The STB core makes no outbound calls to public or peer APIs. The integration service pushes PM2.5 snapshots to it. | Deck slide 11; follows from D-16 and D-17 | The core serves the last pushed snapshot with its age. |
| D-22 | The DDD paper submitted on 16 November, `Makalah_DDD.docx`, is the source of truth for the domain, the bounded contexts, the partner groups, and the use cases. | Owner, 17 Nov | Every other document follows it; DOMAIN_MODEL is its English copy. |
| D-23 | The two partner groups are Veriqu (Katalog Produk) and FlowGanic (Koordinasi Distribusi Sampah). Veriqu's protective products, with rating summaries, appear inside the guidance. FlowGanic's managed waste volume per area and waste type appears in the environment section. Both go through an anticorruption layer in the integration service. | DDD paper, section B | FlowGanic's RW or kelurahan codes map to the pilot areas through an agreed code. Contracts are still needed (Q-03). |
| D-24 | The facility directory is Avela's own simulated list of facilities with services and opening schedule, served by the core. No peer provides it. | DDD paper, sections A and C | Labelled as simulation in the app (D-11). |
| D-25 | The resident picks the area from the pilot-area list. The app does not ask for location. | DDD paper, sections A and C | No location permission and no geocoding. |
| D-26 | A published examination result shows the staff member, the facility, the time, and the next steps. Only its owner reads it. A correction is stored as a new version. | DDD paper, section A | Result versioning is new work (A-31). |
| D-27 | Avela's open host service offers other groups the smoke advisory, the area health signal, and non-sensitive guidance. | DDD paper, sections A and B | The public facility endpoint is dropped. |
| D-21 | App users authenticate with a JWT bearer token. Other groups and the integration service use one `X-API-Key` each, stored hashed and limited by scope. | Deck slide 17 | A peer key never opens reports, identities, or results. |

## Proposed

| ID | Proposal | Why | Confirm by |
| --- | --- | --- | --- |
| P-01 | Write the mobile app in JavaScript with the practicum pattern: Context, `ApiService.js`, Jest. | The deck names `ApiService.js` and says to reuse the KatalogKu pattern. | Before A-05 |
| P-02 | Show a PM2.5 category that refers to the ISPU concentration breakpoints, labelled as a reference and not an official ISPU reading. | Raw µg/m³ alone does not tell a resident what to do. | 23 Nov; breakpoints must be read from the KLHK regulation first (Q-13) |
| P-03 | Photo attachments (A-11) and a custom forecast model (R-01) are stretch items, started only after M3 passes. | Neither is needed for a graded requirement. | 6 Dec |
| P-04 | The area health signal hides any count from 1 to 4. | The paper says small counts are hidden; 1 to 4 is the proposed threshold. | 23 Nov, before A-25 |
| P-05 | Goal targets in [PRD.md](PRD.md) section 2. | The targets are the assistant's estimates. | 23 Nov |
| P-06 | The "agreed identity verification" in the paper works like this in the prototype: at the facility the resident shows the report in the app, staff confirm the name, and the result is drafted against that report, so its owner comes from the report. | No real identity check exists; the report already ties the result to the right account. | Before A-31 |

## Open Questions

| ID | Decision needed | Owner | Due |
| --- | --- | --- | --- |
| Q-03 | Written contracts with Veriqu and FlowGanic (D-23), including FlowGanic's area codes for both pilot areas, plus one backup group. | Riantama | 23 Nov |
| Q-08 | Sources for the protection guidance and the verified local emergency contact. | Riantama | 23 Nov |
| Q-10 | Where the integration service runs: an always-on host or a laptop with a tunnel. | Riantama | 23 Nov |
| Q-12 | STB hardware: architecture, RAM, disk, and whether the image builds on it. | Riantama | 23 Nov (A-04) |
| Q-13 | ISPU PM2.5 breakpoints and averaging period, read from the regulation. | Riantama | 23 Nov |

Resolved: Q-01 (D-06), Q-02 (D-14), Q-04 (simulated staff accounts `petugas1` and `petugas2`), Q-06 (D-08, D-15), Q-09 (D-18, D-19), Q-11 (D-19). Deferred with P-03: Q-05 (custom forecasting), Q-07 (attachments).

## Alternatives Considered

| Alternative | Why it was not chosen |
| --- | --- |
| Onsite-first with digital results only | Does not let a resident get a review before travelling in smoke. |
| Autonomous AI symptom diagnosis | Unvalidated clinical inference; the product is built around human review. |
| Separate staff web console | A second app, deployment, and test surface in four weeks. |
| Core calls Open-Meteo directly | The deck keeps integration off the STB. |
| Population dashboard for health workers | The primary user is the resident. The area health signal covers the area-level view. |

## Change History

| Date | Change |
| --- | --- |
| 2026-11-10 | Name, workspace, theme, and resident direction set. Documentation baseline created. |
| 2026-11-10 | API shortlist researched and design refined. |
| 2026-11-11 | Owner authorized the core build with FastAPI and SQLite. |
| 2026-11-12 | D-06 and D-08 confirmed. D-14 to D-21 added. Scope-freeze gate A-17 retired. |
