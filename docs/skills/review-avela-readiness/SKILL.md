---
name: review-avela-readiness
description: Use when reviewing whether an Avela feature, peer integration, or coursework demo is ready to be marked complete.
---

# Review Avela Readiness

## Inputs

Read the completion claim, changed files, available test evidence, and the relevant IDs in [PRD](../../PRD.md), [ARCHITECTURE](../../ARCHITECTURE.md), and [TODO](../../TODO.md). Read [TEST_PLAN](../../TEST_PLAN.md) for applicable scenarios and [COURSE_REQUIREMENTS](../../COURSE_REQUIREMENTS.md) for submission claims.

This skill reviews readiness. It does not authorize deployment, contact a hospital, create real patient data, or install itself globally.

## Review Procedure

1. Identify what is being claimed: documentation ready, feature implemented, coursework complete, or operational clinical service. Match evidence to that claim.
2. If implementation artifacts exist, trace one relevant resident-to-staff path through actual code/contracts and tests. If they are absent, state that the trace cannot be performed and review only the supplied claim and evidence. Treat fictional scenario facts as supplied facts, not observed runtime behavior. A screenshot or HTTP 200 alone does not demonstrate persistence, ownership, or professional review.
3. Check applicable boundary cases: stale source data, failed peer API, duplicate write retry, cross-account access, facility scope, unanswered report, and unsupported staff/AI authorship.
4. For integration claims, identify the two distinct student groups and the visible feature use. Public providers and mocks must be labeled separately.
5. For release claims, inspect actual APK/device and STB evidence. Read current project commands; if none exist, report that limitation rather than inventing a command or passing result.
6. Report only findings supported by inspected evidence. Distinguish observed defects from missing verification. Update TODO only when asked or when the active task includes maintaining it.

## Output Contract

Return a short verdict with:

- **Claim reviewed** and relevant requirement/task IDs.
- **Evidence checked**, including exact executed commands or an explicit no-execution statement.
- **Findings**, ranked by impact, with file/test references when available.
- **Remaining dependencies**, separating code gaps, external access, staffing, and clinical validation.
- **Next action** needed for the specific completion claim.

Possible verdicts: ready for the stated limited scope, not ready, or insufficient evidence. A successful synthetic demo is never evidence of clinical effectiveness or a staffed hospital service.
