# Decisions and Open Questions

**Updated:** 10 November 2026. Confirmed means explicitly established in the conversation or assignment, not inferred from silence.

## Decision Register

| ID | Decision | Status | Basis / consequence |
| --- | --- | --- | --- |
| D-01 | Product name is Avela. | Confirmed by user | Replace former working name in active product material. |
| D-02 | Workspace is `C:\Users\riant\Projects\avela`; project Markdown belongs in `docs/`. | Confirmed by user | Keep setup package intact; no application scaffold requested. |
| D-03 | Theme is Health & Wellbeing with wildfire-smoke context. | Confirmed direction | Preserve connection to health access rather than generic fire detection. |
| D-04 | Primary experience serves residents, with before-exposure and after-exposure/symptom journeys. | Confirmed direction | Healthcare personnel support the resident journey. |
| D-05 | Explore symptom entry, optional photos, professional review, and onsite follow-up. | User-proposed requirements | Exact fields, clinical workflow, and attachment scope are pending. |
| D-06 | Remote review first, onsite examination when needed. | Assistant recommendation; approval pending | Do not describe this workflow as an already agreed operational service. |
| D-07 | React Native/Expo APK, core STB Docker service, and >=2 peer groups. | Assignment requirement | Website alone does not satisfy the course. |
| D-08 | Backend framework, database, package manager, versions, and hosting. | Pending | Architecture candidates are proposals only. |
| D-09 | Visual identity and design tokens. | Refined proposal using Impeccable | Light/dark roles and screen hierarchy specified; no implemented or visually validated UI. |
| D-10 | PM2.5-focused environmental information; original forecast ambition 6-24 hours. | Prior brainstorming direction, feasibility pending | No independent model or prediction horizon committed. |
| D-11 | A real hospital or puskesmas partnership. | Unconfirmed | Santosa was an example, not an agreement or API grant. |
| D-12 | Staging, commits, and pushes are performed by the user. | Project-setup rule | Agent leaves changes unstaged and provides commands when useful. |
| D-13 | Open-Meteo forecast/geocoding, optional BMKG weather, optional OpenAQ observations. | Evidence-backed recommendation | Official docs and four public probes reviewed; not final pilot/production validation. |

## Alternatives Considered

| Alternative | Strength | Cost or limitation | Current position |
| --- | --- | --- | --- |
| Onsite-first with digital results | Simpler staff process and fewer remote-service assumptions | Does not support pre-visit professional review from home | Valid alternative awaiting choice |
| Remote review with onsite follow-up | Matches the user's desire to assess concerns before unnecessary travel | Requires a real queue, availability communication, accountable reviewers, and escalation | Recommended draft |
| Autonomous AI symptom diagnosis | Could appear fast in a demo | Unvalidated clinical inference and treatment claims; unnecessary for requested human review | Excluded from proposed MVP |
| Population-priority dashboard for health workers | Supports area-level planning | Primary user differs from the resident direction | Historical exploration, not current scope |

## Questions Required Before Scope Freeze

| ID | Decision needed | Evidence to prepare | Owner |
| --- | --- | --- | --- |
| Q-01 | Choose onsite-first or remote-first primary workflow. | One concrete resident and staff walkthrough | Project owner |
| Q-02 | Choose pilot area and fictional demo population. | Provider coverage samples and accessible facility information | Team |
| Q-03 | Identify two student-group service providers. | Named contacts, written endpoints, sample responses, rate limits | Team |
| Q-04 | Define who reviews reports and when. | Simulated demo staffing plan; real partner interview if available | Project owner / clinical contact |
| Q-05 | Decide forecast reuse versus custom modeling. | Historical data availability, baseline, holdout plan | Team |
| Q-06 | Approve stack and operator interface. | STB architecture/resources and a bounded workload estimate | Team |
| Q-07 | Decide attachment scope and retention. | Upload/storage budget and role-based access design | Team |
| Q-08 | Approve reviewed content and escalation policy. | Source register and qualified review where clinical advice is shown | Clinical reviewer, not yet assigned |
| Q-09 | Assign team roles, class, registry name, and domain. | Team agreement and registry entry | Team |

## Freeze Criteria

- One primary workflow, target population, and pilot area are selected.
- Every essential data source has a successful relevant sample or an explicit labeled demo fallback.
- Core domain behavior is defined beyond proxying a public API.
- Two peer integration contracts have owners and demonstrable feature uses.
- Clinical scope, staff availability, emergency bypass, and simulated-versus-real service boundaries are explicit.
- Stack and deployment split fit the STB and two-person schedule.
- Mandatory features have acceptance cases; deferred work is named.
- The owner approves the resulting scope. Documentation creation alone is not approval of its proposals.

## Change History

| Date | Change | Evidence |
| --- | --- | --- |
| 2026-11-10 | Avela selected as final name. | Explicit user message |
| 2026-11-10 | Documentation setup requested in Avela workspace. | Explicit user message |
| 2026-11-10 | Draft baseline records resident journeys, options, and unresolved dependencies. | Documentation work; does not freeze implementation |
| 2026-11-10 | API recommendations and design refined at user request. | Public-apis discovery, provider documentation, bounded probes, and Impeccable source guidance |
