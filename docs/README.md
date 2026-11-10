# Avela

Avela is a proposed mobile companion that helps residents understand wildfire-smoke exposure, prepare for outdoor activity, report symptoms from home, and receive follow-up from healthcare personnel.

**Status:** Documentation baseline; no application has been implemented.

**Updated:** 10 November 2026.

**Documentation language:** English, as required by the project-setup skill. Proposed user-interface language: Indonesian.

**Workspace:** `C:\Users\riant\Projects\avela`.

## Problem Solved

Residents need to connect environmental information with practical protective actions and access to care. A pollution reading alone does not tell someone how to report a worsening condition or obtain professional follow-up. Avela explores a continuous journey from environmental awareness to a reviewed symptom report and, when needed, an onsite examination.

The intended benefit is fewer unnecessary journeys during smoke episodes without delaying necessary care. This is a product hypothesis, not an observed outcome or a clinical claim.

## Key Features and Current Availability

Available now: this documentation set and the supplied `project-setup/` skill package.

Planned capabilities, not implemented:

- Location-based air-quality information with source, freshness, and uncertainty context.
- Reviewed protective guidance before exposure.
- Structured symptom reports and optional supporting attachments.
- A staff review workflow with clearly communicated service availability.
- Facility discovery, onsite follow-up, and patient-specific examination results.

The remote-review-first pathway is a recommendation awaiting explicit product approval. The user proposed both onsite-first and remote-first pathways; neither has been implemented.

## Screenshot or Demo

No interface, deployment, APK, screenshot, or working clinical integration is available. Do not present design proposals as product screenshots.

## Tech Stack and Rationale

React Native with Expo and an Android release APK are course requirements. Docker deployment of a core microservice on an STB is also required. Backend framework, database, package manager, versions, operator interface, and integration hosting remain proposed or pending. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Installation and Setup

There are no application installation or launch commands yet. No package manifest, lockfile, Docker Compose file, API server, or test runner exists. Do not run guessed scaffold commands based on this document.

To resume documentation work:

1. Open this workspace.
2. Read [AGENTS.md](AGENTS.md), [WORKFLOW.md](WORKFLOW.md), and [TODO.md](TODO.md).
3. Use [DECISIONS.md](DECISIONS.md) to distinguish confirmed direction from proposals.
4. Read the relevant specification before editing.

## Documentation Map

| Document | Purpose |
| --- | --- |
| [PRD.md](PRD.md) | Product requirements and proposed MVP boundaries |
| [AGENTS.md](AGENTS.md) | Agent and developer instructions |
| [DESIGN.md](DESIGN.md) | Proposed visual tokens and interaction rules |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Component boundaries, stack candidates, and implementation sequence |
| [TODO.md](TODO.md) | Current task status and blockers |
| [WORKFLOW.md](WORKFLOW.md) | Work, verification, and handoff rules |
| [PRODUCT_FLOWS.md](PRODUCT_FLOWS.md) | Resident and staff journeys, states, and exceptions |
| [DOMAIN_MODEL.md](DOMAIN_MODEL.md) | Proposed DDD model and bounded contexts |
| [API_CONTRACT.md](API_CONTRACT.md) | Draft contracts and integration boundaries |
| [DATA_SOURCES.md](DATA_SOURCES.md) | Candidate data sources and feasibility audit |
| [SAFETY_PRIVACY.md](SAFETY_PRIVACY.md) | Clinical boundaries, synthetic data, access, and privacy requirements |
| [TEST_PLAN.md](TEST_PLAN.md) | Acceptance scenarios and evaluation strategy |
| [COURSE_REQUIREMENTS.md](COURSE_REQUIREMENTS.md) | Assignment requirements, deadlines, and evidence |
| [DECISIONS.md](DECISIONS.md) | Decisions, open questions, and freeze criteria |
| [REFERENCES.md](REFERENCES.md) | Sources, provenance, and limits of evidence |
| [skills/review-avela-readiness/SKILL.md](skills/review-avela-readiness/SKILL.md) | Reusable readiness-review procedure |
| [VALIDATION_REPORT.md](VALIDATION_REPORT.md) | Documentation checks and verification limits |

## Source of Truth

PRD owns product scope; ARCHITECTURE owns the proposed implementation; DESIGN owns visual tokens; TODO owns work status. DECISIONS records why and when choices changed. Other documents elaborate these sources rather than silently overriding them.

Documentation is intentionally centralized in `docs/` at the user's request. `docs/AGENTS.md` is not automatically a root-wide instruction file: agents working outside `docs/` must explicitly read it. The local skill is a documentation-local resource, not a globally installed skill.
