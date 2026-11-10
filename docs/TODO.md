# Avela Task Tracker

**Updated:** 10 November 2026. Status values: Pending, In progress, Blocked, Done. Done requires the completion criterion in ARCHITECTURE to be checked.

| ID | Task | Status | Next step or verification |
| --- | --- | --- | --- |
| A-00 | Establish documentation baseline | Done | 18 Markdown files, 42 relative links, 20 shared task IDs, 20 token references checked; no dependency cycles; skill validator and independent review passed for documentation scope. |
| A-01 | Select preliminary workflow and demo boundary | Pending | Select primary workflow, pilot candidate, and simulated staffing; final freeze is A-17. |
| A-02 | Audit environmental data | Pending | Select pilot candidates and obtain relevant redacted API samples. |
| A-03 | Agree peer integrations | Pending | Identify two distinct groups and write feature-level contracts. |
| A-04 | Validate stack and STB | Pending | Inspect actual hardware/resources after scope choice; approve stack. |
| A-16 | Prepare and submit the DDD milestone | Pending | Due end of Week 13; use approved A-01 scope and available A-03 peer context, not the final APK. |
| A-17 | Approve final MVP scope and implementation readiness | Pending | Requires A-01/A-02/A-03/A-04 and all DECISIONS freeze criteria; get owner scope approval. |
| A-05 | Scaffold app and core contract | Pending | Requires A-17 and implementation authorization. |
| A-06 | Implement identity and ownership | Pending | Requires A-05; include negative access tests. |
| A-07 | Implement environmental context | Pending | Requires A-02/A-05; verify stale/unavailable states. |
| A-08 | Implement symptom reports | Pending | Requires A-06; verify persistence and retry idempotency. |
| A-09 | Implement staff review | Pending | Requires A-08; professional/simulated authorship must be explicit. |
| A-10 | Implement facility and result flow | Pending | Requires A-03/A-09; verify peer use and correct-patient delivery. |
| A-11 | Implement optional attachments | Pending | Requires A-08 and Q-07; may be deferred out of MVP. |
| A-12 | Review guidance and failure UX | Pending | Requires A-07/A-09; exact clinical protocol not yet selected. |
| A-13 | Deploy public core on STB | Pending | Requires A-06/A-08; class, registry, hostname, hardware unknown. |
| A-18 | Publish Registry and peer-access milestone | Pending | Requires A-13; due end of Week 14, before final APK packaging. |
| A-14 | Release and test Android APK | Pending | Requires A-10/A-12/A-13. |
| A-15 | Assemble final submission evidence | Pending | Requires A-14/A-16/A-18; Markdown docs alone do not satisfy submission formats. |
| R-01 | Evaluate optional prediction model | Pending | Requires data audit and explicit research-scope choice; not mandatory MVP. |

## Known Dependencies

No live partner, peer contract, pilot region, clinical reviewer, final stack, or provider feasibility result is confirmed. These are planning dependencies, not failures of an implemented system. Scope approval and feasibility work are the next useful steps; do not begin by adding complex AI components.

## Verification Log

| Date | Work | Evidence / result |
| --- | --- | --- |
| 2026-11-10 | Read setup package and inspected repository | Existing repository contained `.git/` and untracked `project-setup/`; branch main, origin observed. |
| 2026-11-10 | Drafted project documentation | Product status and proposed choices separated; final checks recorded in VALIDATION_REPORT. |
| 2026-11-10 | Validated documentation baseline | Link/token/task checks passed; independent findings on milestone timing and scope-freeze dependencies corrected and rechecked. |
