# Avela Working Workflow

## Start or Resume

1. Confirm the working directory is the Avela repository.
2. Read AGENTS, TODO, and DECISIONS, then the relevant PRD requirements.
3. Inspect actual files and Git status. Treat documentation about implementation as a claim requiring code evidence.
4. Choose a task that is authorized and whose dependencies are satisfied.

## Proceed and Clarify

Proceed autonomously on reversible, clear work within the request. Documentation cleanup, consistency repairs, and read-only inspection do not need repeated permission. Ask when choosing between materially different product flows, expanding scope, introducing real patient handling, or claiming a clinical partnership.

Current authorization covers complete documentation setup. It does not request application scaffolding, package installation, deployment, messages to hospitals, publication, or registration of a domain.

## Document Ownership

| Change | Primary document | Also check |
| --- | --- | --- |
| Product behavior or scope | PRD | PRODUCT_FLOWS, TEST_PLAN, TODO |
| Confirmed choice | DECISIONS | Affected specifications |
| Technical boundary or stack | ARCHITECTURE | API_CONTRACT, DOMAIN_MODEL, TODO |
| Visual rule | DESIGN | Future component implementation |
| Data availability | DATA_SOURCES | REFERENCES, ARCHITECTURE, risk entries |
| Clinical content or data access | SAFETY_PRIVACY | PRD, TEST_PLAN, operator flow |
| Work result | TODO | VALIDATION_REPORT when documentation changes |

## Evidence Labels

Use **Confirmed**, **Assignment requirement**, **Proposed**, **Unverified**, and **Observed** precisely. Do not promote a research-paper claim into independently verified clinical evidence. An API returning HTTP 200 proves neither suitable coverage nor safe use. A mock proves contract behavior only.

## Feature Completion

A feature is done when its architecture completion criterion and relevant PRD acceptance cases pass, including meaningful failure conditions. Record commands, environment, and results. Disclose unrun checks. An HTTP success code or screenshot alone is insufficient for persisted writes, authorization, staff authorship, or peer integration.

Use the project-local readiness-review skill for consequential feature reviews. It separates implementation evidence, external dependencies, and draft assumptions.

## Documentation Completion

Read all newly written documents, check internal links and frontmatter, confirm status consistency, and ensure there are no invented runtime commands. Record what was checked and what remains pending. No application tests should be reported as passing when no implementation exists.

## Clinical and Operational Changes

Maintain professional review boundaries and truthful availability. Clinical guidance or escalation rules require sourced content and appropriate review before operational use. A demonstration uses synthetic cases and visibly simulated staff. Changes to response guarantees or medical decision-making are scope decisions, not routine UI edits.

## Handoff

Use [BRANCH_PLAN.md](BRANCH_PLAN.md) for the proposed short-lived branch and PR workflow. Create branches only when their work starts; do not treat the planned catalogue as existing branches or as implementation authorization. Feature tests ship with their feature. Keep unrelated working-tree changes outside the task.

Summarize completed work, verification, and unresolved dependencies. Update TODO with the next concrete action. The user performs Git staging, commits, and pushes; provide commands matching the observed branch and remote when appropriate. Do not create live clinical or external-service commitments through documentation wording.
