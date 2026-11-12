# Avela Branch Plan

**Updated:** 12 November 2026. Only `main` exists. No branch protection, tag, or pull request has been created.

## Strategy

`main` is the only long-lived branch. Each task or small group of tasks gets a short-lived branch, merged when its completion criteria pass, then deleted. There is no `develop`, `backend`, `frontend`, or per-person branch.

`main` must always start and pass its tests. Unfinished screens stay out of the tab bar until they work.

## Naming

| Prefix | Purpose | Example |
| --- | --- | --- |
| `docs/` | Documents and submission files | `docs/ddd-submission` |
| `chore/` | Tooling, scaffolds, release setup | `chore/mobile-scaffold` |
| `feat/` | A capability in the core, integration service, or app | `feat/exposure-context` |
| `infra/` | Deployment and runtime configuration | `infra/stb-deployment` |
| `fix/` | One defect with a regression test | `fix/report-retry-duplicates` |
| `research/` | Stretch experiments | `research/pm25-baseline` |

Lowercase with hyphens. No names, credentials, or patient details. Put task IDs in the commit or pull-request text.

## Branch Catalogue

Create a branch when its work starts.

| Branch | Tasks | Milestone |
| --- | --- | --- |
| `docs/plan-realignment` | A-21, A-22 | M0 |
| `docs/peer-contracts` | A-03 | M0-M2 |
| `docs/ddd-submission` | A-16 | M1 |
| `feat/areas-snapshots` | A-23 | M1 |
| `feat/exposure-context` | A-24 | M1 |
| `feat/peer-api` | A-25 | M1 |
| `chore/mobile-scaffold` | A-05 | M1 |
| `infra/stb-deployment` | A-04, A-13 | M2 |
| `docs/api-registry` | A-18 | M2 |
| `feat/integration-environment` | A-02, A-07 | M2 |
| `feat/mobile-reports` | A-26 | M2 |
| `feat/peer-integrations` | A-10 | M3 |
| `feat/mobile-staff` | A-27 | M3 |
| `feat/mobile-guidance-states` | A-12 | M3 |
| `chore/mobile-tests` | A-28 | M3 |
| `chore/android-release` | A-14 | M4 |
| `docs/final-submission` | A-15 | M4 |
| `feat/report-attachments` | A-11 | Stretch |
| `research/pm25-baseline` | R-01 | Stretch |

The uncommitted work on `main` today (core API, STB files, DDD draft, realigned documents) goes in as the baseline for A-22, either directly on `main` or through `docs/plan-realignment`.

## Order of Work

1. Core changes that alter a payload (A-23 to A-25) merge before the app screens that read them.
2. The mobile scaffold merges before any feature screen, so navigation and `ApiService.js` are not created twice.
3. Deployment (A-13) can start as soon as A-04 passes; it does not wait for the app.
4. Tests ship in the same branch as the feature they cover.

## Merging

- Open a pull request into `main`, list the task IDs, the checks that ran, and any mock still in use.
- Squash-merge a finished branch into one commit.
- When both members are working, the other member reviews. When only one is available, self-merge after the checks pass and say so in the pull request.
- Update a branch with a normal merge from `origin/main`. Do not rewrite history that is already pushed.

Both members need visible commits: individual grades follow GitHub contribution (C-01).

## Tags

| Tag | Meaning |
| --- | --- |
| `v0.1.0` | Core public on the STB and listed in the Registry (M2) |
| `v0.2.0` | Resident and staff flow integrated with two peers (M3) |
| `v1.0.0` | Submission build (M4) |

Record the commit deployed to the STB, to the integration host, and built into the APK.

## Starting a Branch

```powershell
git status --short
git switch main
git pull --ff-only origin main
git switch -c feat/areas-snapshots
```

Stage only the paths the task touched, check `git diff --cached`, commit, and push the branch. Do not reset, stash, or stage another person's changes to switch branches.
