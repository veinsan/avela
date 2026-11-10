# Clinical Boundaries, Privacy, and Operational Integrity

**Status:** Product design requirements for a synthetic coursework prototype. This document is not a clinical protocol, legal compliance assessment, or authorization to operate a telemedicine service.

## Clinical Responsibility

Environmental data describes an area and period, not a person's diagnosis or measured dose. Resident-entered symptoms and photographs are supporting information, not conclusive evidence of a disease. Clinical assessments, medication instructions, and examination findings must be attributed to an appropriately authorized professional in any real service.

For the demo, staff identities and cases are fictional and clearly labeled. AI-generated summaries, if later added, remain drafts for review and must preserve uncertainty and resident wording. Do not label them doctor's advice or claim a photograph shows lung condition.

## Emergency Access and Waiting

Emergency-access information must be visible before and during the reporting flow and available without completing registration or waiting for staff. Exact prompts and screening rules require qualified review. The app must not tell users they are safe because an automated check did not flag a concern.

Official smoke guidance identifies breathing difficulty and chest pain as reasons for urgent help; see the source in REFERENCES. This is rationale for bypassing a message queue, not a complete triage algorithm. Do not hard-code foreign emergency numbers from source documents into an Indonesian interface. Verify local channels before display.

Do not equate staying indoors with safety under every circumstance or contradict official evacuation instructions. No smoke forecast is an evacuation order, safe-route certificate, or guarantee that a household is protected.

## Staff Operations

Publish real service hours only when established. A submitted report is an acknowledgment of receipt, not a promise that a clinician is watching it. Display waiting, unavailable service, and unanswered reports honestly. Do not promise a response time without staffing capacity and an agreed service process.

Before any operational pilot, assign clinical ownership, escalation responsibility, approved content, reviewer credentials, outage handling, and user support. These are currently absent; the coursework prototype should not accept real consultations.

## Data Classification

| Class | Examples | Handling |
| --- | --- | --- |
| Public context | Source-attributed environmental data | Cache only under provider terms; preserve timestamps |
| Public directory | Facility address and source-published services | Attribute and display verification age |
| Sensitive case data | Reports, attachments, results, relevant health history | Synthetic only in course; private, owner/facility scoped |
| Operational metadata | Request IDs, error categories, state-change times | Minimize personal content |
| Secrets | Passwords, tokens, peer keys, tunnel credentials | Environment/config secrets; never Markdown, Git, or APK |

## Access and Identity

- Derive resident identity from authentication; reject client attempts to select another owner.
- Enforce facility membership on staff reads and writes.
- Link external examination records to the correct account through a verified mapping process.
- Scope peer API keys to intended non-sensitive services. Clinical publishing requires separate authorization.
- Enforce attachment access at retrieval time; random filenames are not authorization.
- Audit publication and correction with actor, time, version, and resource identifier.

## Minimization and Retention

Collect only fields needed for the agreed demo journey. Avoid national identifiers, exact household locations, and unrelated history. Manual area selection should be possible. Real patient photographs must not be used as demo fixtures.

Define retention periods, account deletion behavior, correction history, backup expiry, and private local-cache behavior before implementing attachments or a real pilot. No retention duration is approved yet. Offline drafts should not persist across account logout without a documented design.

## Attachments

Treat uploaded files as untrusted. Validate allowed size, MIME/content type, and storage bounds; prevent executable serving; remove unnecessary metadata where feasible; use private access. Explain that attachments are optional and do not guarantee remote diagnosis. Do not send images or health narratives to an external AI provider without a separately reviewed need and data policy.

## Content Governance

Each published guidance item needs source title/link, source date if known, content version, reviewer/review status, and applicability limits. Unreviewed text may appear in a labeled design fixture but must not masquerade as operational advice. Keep environmental interpretation separate from staff-authored personalized instructions.

## Release Boundaries

A successful classroom demo establishes software behavior under synthetic scenarios. It does not establish diagnostic accuracy, safety in actual emergencies, hospital integration permission, clinical staffing, regulatory compliance, or health benefit. Document these limitations beside the demo and in its handoff.
