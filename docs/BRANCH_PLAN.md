# Avela Branch Plan

**Status:** Proposed collaboration plan, prepared at the user's request on 10 November 2026. No branches, protection rules, tags, or pull requests were created by this documentation task.

## Strategy

Keep `main` as the single long-lived integration branch. Create short-lived branches for bounded deliverables, review them through pull requests, and merge once their applicable checks pass. Delete merged feature branches when their work is safely integrated.

For two contributors, a permanent `develop`, `backend`, `frontend`, or per-person branch would add reconciliation work without a clear release need. Backend/mobile ownership belongs in responsibilities and repository paths, not permanent branch separation. Every branch contains the whole repository; its name identifies its scope, not exclusive access to one directory.

`main` should remain usable for the capabilities already delivered. Early `main` may contain only documentation or a small working vertical slice; this does not mean the full product is complete. Do not enable unfinished clinical workflows in a demo simply because a partial implementation was merged.

## Naming

| Prefix | Purpose | Example |
| --- | --- | --- |
| `docs/` | Scope, contracts, DDD, handoff, and submission documents | `docs/mvp-scope` |
| `chore/` | Shared foundations, tooling, and build setup | `chore/project-foundation` |
| `feat/` | A user-visible or service capability | `feat/symptom-reports-api` |
| `infra/` | Deployment and runtime configuration | `infra/stb-deployment` |
| `fix/` | A specific defect with regression evidence | `fix/report-retry-duplicates` |
| `research/` | Optional bounded feasibility experiment | `research/pm25-baseline` |

Use lowercase names and hyphens. No credentials, patient information, or personal names in branch names. Put architecture IDs in the PR description rather than making branch names difficult to read.

## Planned Branch Catalogue

These are branch names to create when work starts, not a request to create all branches now. A = backend/business contributor; B = mobile contributor. Actual people are not assigned yet. Paths are proposed in ARCHITECTURE and do not exist as application code today.

| Branch | Owner | Task mapping | Deliverable and completion evidence |
| --- | --- | --- | --- |
| `docs/mvp-scope` | A + B | A-01, A-17 | Record selected workflow, pilot, boundaries, and approval; final freeze waits for data, peers, and stack evidence. |
| `docs/api-feasibility` | A | A-02 | Complete pilot mapping, provider terms, source metadata, and failure-design audit; preserve executed evidence. |
| `docs/peer-contracts` | A + B | A-03 | Two named peer groups with useful feature contracts, fixtures, access arrangements, and mock policy. |
| `docs/stack-validation` | A + B | A-04 | Choose stack and operator surface using STB/resource evidence; record actual compatible versions. |
| `docs/ddd-submission` | A, reviewed by B | A-16 | DDD paper, required cover/paragraphs/diagram, and early submission evidence. |
| `chore/project-foundation` | A + B; one merge owner | A-05 | Shared repository layout, app navigation shell, core health endpoint, contracts, and real build/test commands. |
| `feat/auth-access` | A | A-06 | Server identity, resident ownership, staff facility scope, and negative authorization tests. |
| `feat/mobile-foundation` | B | A-05, A-06 | Design tokens/components, native navigation, login UI, session handling, and tested error states; completes mobile portions of shared tasks. |
| `feat/environment-api` | A | A-07 | Off-STB forecast/place/weather adapters, source-aware metadata, partial failures, and contract tests. |
| `feat/environment-mobile` | B | A-07, A-12 | Environmental screen, provenance, forecast trend/list, location selection, and failure states against the agreed contract. |
| `feat/symptom-reports-api` | A | A-08 | Persistent reports, ownership, append-only updates, idempotency, and tests. |
| `feat/symptom-reports-mobile` | B | A-08 | Report form, preview, submission, history/detail, retry handling, and component/flow tests. |
| `feat/staff-review` | A, B assists on UI | A-09 | Queue, claim, clarification, attributed response, state transitions, and concurrency evidence; operator surface must already be selected. |
| `feat/facilities-results-api` | A | A-10 | Peer adapters and result publication/linkage with access and outage tests. |
| `feat/facilities-results-mobile` | B | A-10 | Facility list/detail and owner-only result presentation using integrated services. |
| `feat/report-attachments` | A + B | A-11, conditional | Private bounded upload and resident UX with access/failure tests; omit this branch if attachments are deferred. |
| `feat/guidance-accessibility` | B, qualified content review pending | A-12 | Sourced guidance presentation, availability notices, emergency-access navigation, dark theme, large-text and assistive-technology checks. |
| `infra/stb-deployment` | A | A-13 | Core deployment only: HTTPS, resource limits, persistent data, rate limiting, restart, backup/restore evidence. |
| `docs/api-registry` | A | A-18 | Public API documentation, peer access instructions, and Week 14 Registry evidence. |
| `chore/android-release` | B | A-14 | Branding, EAS release configuration, installed APK, and release test evidence. |
| `docs/final-submission` | A + B | A-15 | Final document formats, links, test report, demo/video, and submission checklist. |
| `research/pm25-baseline` | A or agreed research owner | R-01, optional | Independent baseline evaluation; record failure to improve honestly; no required product dependency. |

A task can span API and mobile branches. Mark its TODO entry Done only when its complete acceptance criteria pass across both sides. A merged UI mock does not complete integration. Tests belong with the feature that needs them rather than being postponed to a final testing branch.

## Execution Order and Parallel Work

### 1. Settle the buildable scope

Use short documentation branches for A-01 through A-04. Merge preliminary choices promptly; return to `docs/mvp-scope` through a new short-lived PR when final A-17 evidence is ready. Do not leave one draft branch diverging for weeks while waiting for external answers.

The DDD paper has an early deadline and must not wait for APK completion. Its draft can use explicitly labeled incomplete partner details; the final submission must reflect what the team actually knows.

### 2. Merge shared foundations first

Merge `chore/project-foundation` before both contributors edit the same new manifests, lockfiles, navigation setup, or contract layout. Agree one package manager and one person responsible for each shared foundation PR. This reduces conflicting bootstrap changes.

### 3. Build API and mobile against the same contract

After foundations, A can work on auth/API while B works on mobile primitives and login screens. Then pair environmental and reporting branches by capability. Merge contract definitions and synthetic fixtures before consumers depend on them.

B may use contract fixtures while A implements the server, but fixture mode must remain explicit. Merge a screen only if it builds and behaves honestly with its current source. Do not mark end-to-end behavior complete until real approved endpoints are wired and tested.

Prefer each contributor having one implementation branch active. Start a dependent branch from updated `main` after its prerequisite merges. Avoid stacked PRs unless a specific dependency makes them worthwhile and the rebase/merge base is explicitly documented.

### 4. Deliver early deployment and Registry milestones

Start STB configuration preparation once framework/resource choices are known. Deployment completion still requires the working core and relevant checks. Target DDD by **22 November 2026**, and public microservice/Registry readiness by **29 November 2026**, following the assignment week ranges. These deadlines are not delayed by later peer/mobile features.

### 5. Finish integrated APK and submission

Integrate facilities/results and reviewed guidance, then verify the installed APK and prepare final evidence. Target final submission by **13 December 2026, 23:59 WIB**. Branches organize this work; their existence is not evidence a milestone is complete.

## Pull Requests and Merge Rules

Each PR describes the user-visible behavior or technical boundary, lists task/requirement IDs, records applicable checks, and states remaining mocks/external dependencies. Keep migrations and matching API/schema changes together. Include screenshots from the actual app when reviewing implemented UI; do not claim native checks from browser images.

Recommended merge method: squash a completed feature PR into one clear commit on `main`. This is a proposed team convention, not a GitHub setting already configured. Preserve meaningful review history in the PR. Synchronize a shared branch with a normal merge from `origin/main`; avoid rewriting history others are using.

Suggested protection when configured: pull requests into `main`, no force-push, no deletion of `main`, and applicable CI checks. Require peer review when both members are available; agree a documented exception for deadline-critical fixes rather than pretending a review occurred. Do not configure checks that do not exist yet. Current GitHub branch-protection state has not been inspected or changed.

## Releases and Deployment

Use annotated tags on verified `main` commits for milestone snapshots rather than permanent release branches. Proposed tags: `v0.1.0` for a verified public core API milestone, `v0.2.0` for the integrated resident/staff flow, and `v1.0.0` for the coursework submission build. These are proposed labels, not promises of clinical production readiness. No tags currently exist as part of this plan.

Record the commit SHA used for the STB service, integration service, and APK; deployments need not happen simultaneously. Check contract compatibility before deploying one component ahead of another. Do not automatically deploy every feature branch to the shared STB. A release-fix branch is only needed if a tagged artifact must be patched independently while main has moved on; merge the corresponding fix back into main.

## Practical Git Sequence

Example for a future authorized task, after unrelated local changes have been handled by their owner:

```powershell
git status --short
git switch main
git pull --ff-only origin main
git switch -c feat/environment-api
```

After implementing and verifying the feature, stage only its intended paths, inspect the staged diff, commit, and publish that branch. Open its PR against `main`. These are workflow instructions, not commands executed during this planning task.

Do not reset, stash, restore, or stage someone else's changes merely to switch branches. At this plan's creation, `project-setup/` already had unstaged deletions. Leave them alone. If a branch cannot be isolated safely, use a separately authorized worktree or ask the change owner how to handle them.

## Current State and Next Branch

Observed local/cached remote refs: `main` and `origin/main`. No remote branch inventory refresh was performed for this plan. Existing documentation was previously committed directly on main at the user's request; the proposed PR workflow applies to future work.

The next useful work branch is `docs/mvp-scope`, when the owner is ready to select the primary workflow. This branch plan does not freeze product scope, create application branches, authorize implementation, or change the project's Git permissions. Git mutations follow the user's explicit instructions; ordinary documented defaults remain in WORKFLOW.
