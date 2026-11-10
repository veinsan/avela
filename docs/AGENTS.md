# Avela Agent and Developer Instructions

## Project Overview

Avela is a documentation-stage resident health companion for wildfire-smoke conditions. Read [README.md](README.md), [WORKFLOW.md](WORKFLOW.md), [TODO.md](TODO.md), and [DECISIONS.md](DECISIONS.md) before continuing work. Product requirements live in [PRD.md](PRD.md).

This file is intentionally under `docs/`. Its automatic directory scope does not cover future root-level application code. Explicitly read it when working anywhere in this repository; do not assume a root instruction file exists.

## Tech Stack

- Required platform: React Native with Expo and Android release APK.
- Required backend placement: core microservice in Docker on STB, publicly reachable via the course tunnel arrangement.
- Proposed backend: Python/FastAPI and SQLite for a bounded demo; not selected or installed.
- Integration hosting, staff interface, versions, and package manager: pending.
- No installed application dependencies, package manifests, or runnable scripts exist at the baseline.

## Design System

[DESIGN.md](DESIGN.md) holds proposed tokens and interaction states. It is not an approved visual design. If approved later, update tokens and consuming components together. Product UI is proposed in Indonesian; maintained project documents are English.

## Project Structure

```text
docs/           Requirements, plans, source register, and verification records
  skills/review-avela-readiness/SKILL.md
```

Future application paths in ARCHITECTURE are planned, not existing folders. Do not create empty application scaffolds during documentation-only work.

The original `project-setup/` package was removed at the user's request. Its initial committed version is linked in REFERENCES; the maintained project instructions remain in `docs/`.

## Code and Contract Conventions

When implementation is authorized, use the agreed stack and lockfile. Proposed conventions: strict TypeScript for the mobile app; explicit schemas at API boundaries; UTC timestamps in transport; user-local display times; pollutant units preserved; domain logic separate from provider adapters. Confirm library compatibility before pinning versions.

Use stable requirement and task IDs. Keep provider-specific fields behind adapters. Derive actor identity from authenticated credentials, not client-submitted user IDs. Clinical response authorship and report ownership are server-enforced.

## Feature Status

- [x] Documentation baseline created.
- [ ] Environmental data integration audited and implemented.
- [ ] Resident application implemented.
- [ ] Staff review and results implemented.
- [ ] Two peer-group services integrated.
- [ ] STB deployment and APK verified.

These unchecked entries are planned work, not bugs in an existing application.

## Boundaries

- Use synthetic patient data only for this coursework.
- Do not publish source-document credentials, live tokens, private health records, or real patient images.
- Do not run AI inference, frontend hosting, or mobile builds on the STB.
- Do not present AI output as clinician-authored advice or a diagnosis.
- Do not mark a draft, pending API, partner, or model as verified.
- Preserve the user's chosen name and resident-focused direction.
- Clarify decisions that materially change scope; proceed on routine authorized edits without repeated approval requests.

## Testing and Build

No application test/build commands exist. Follow [TEST_PLAN.md](TEST_PLAN.md) when they are introduced. Documentation verification consists of reading all changed files, resolving relative links, checking token references and task IDs, inspecting Git diff/status, and validating the local skill frontmatter.

Use [the readiness-review skill](skills/review-avela-readiness/SKILL.md) when reviewing a proposed completed feature, integration, or demo. It does not install tools or grant access to external systems.

## Git Rules

The user handles staging, committing, and pushing. Leave changes unstaged. Repository observed on 10 November 2026: branch `main`, remote `origin` at `https://github.com/veinsan/avela`. Recheck before giving commands in a later session.

For this documentation set, the user can run:

```powershell
git add -- docs
git diff --cached
git commit -m "docs: establish Avela project documentation"
git push origin main
```

Do not change Git configuration or add unrelated files.
