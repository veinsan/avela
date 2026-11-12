# Avela Working Workflow

## Start or Resume

1. Read [TODO.md](TODO.md), starting with "Next Three Actions".
2. Read [AGENTS.md](AGENTS.md) and the PRD stories for the task you pick.
3. Run `git status --short` and the core tests. A document saying something works is a claim; the code and tests are the evidence.
4. Pick a task whose dependencies in [ARCHITECTURE.md](ARCHITECTURE.md) are Done.

## Proceed Within Scope

Implementation is authorized for everything in scope in [PRD.md](PRD.md) section 7. Work without asking on tasks in the implementation plan, their tests, and the documents they affect.

Work in milestone order. Do not start a later milestone's task while an earlier milestone has an unblocked task, unless the owner says so. Stretch tasks wait until M3 passes.

## Ask First

- A change to PRD scope, or starting a stretch item.
- Anything in the Proposed or Open tables of [DECISIONS.md](DECISIONS.md) that the task depends on.
- A new dependency, service, or hosting choice.
- Anything that touches a real person, a real facility, or a shared course account.
- Deleting data, rewriting Git history, or deploying to the STB.

## Verify Completion

A task is Done when:

1. Its completion criteria in ARCHITECTURE and the acceptance criteria of its PRD stories pass, including the failure cases.
2. The tests or manual steps were actually run, and the command and result are written in the TODO row.
3. Checks that could not be run are named in the same row.

An HTTP 200 or a screenshot does not prove persistence, authorization, or a live peer integration. Use [the readiness-review skill](skills/review-avela-readiness/SKILL.md) for a feature that crosses the API and the app, a peer integration, or a release.

Each milestone has a gate: every task in it is Done or explicitly moved, and the course deliverable for that week is submitted.

## Keep Documents Current

| Change | Update first | Then check |
| --- | --- | --- |
| Scope or product behavior | PRD | PRODUCT_FLOWS, TEST_PLAN, TODO |
| A decision | DECISIONS | The documents it affects |
| Stack, structure, or task plan | ARCHITECTURE | TODO, AGENTS |
| Endpoint or payload | API_CONTRACT | `services/core/README.md`, DOMAIN_MODEL |
| Visual rule | DESIGN | The app theme module |
| Provider or peer | DATA_SOURCES or API_CONTRACT | REFERENCES |
| Task status | TODO | - |

State facts plainly. Label a statement Proposed only when it is listed in DECISIONS as proposed. Clinical limits are written once, in [SAFETY_PRIVACY.md](SAFETY_PRIVACY.md).

## Hand Off

End each task with a summary of what changed, what was verified, and what is still open. Update the TODO row. Then give the owner the Git commands from AGENTS with real paths, message, and branch. The owner stages, commits, and pushes unless the same message asks the agent to do it.
