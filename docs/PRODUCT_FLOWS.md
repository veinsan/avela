# Product Flows

**Status:** Proposed interaction specification, pending Q-01 in [DECISIONS.md](DECISIONS.md). All clinical interactions in the coursework demo use simulated staff and fictional data.

## Flow A: Before Exposure

1. Resident selects an area manually or grants location permission.
2. Avela loads an environmental snapshot. It identifies whether values are observations, forecasts, cached values, or synthetic demo data.
3. Resident reads conditions and a plain-language explanation. A value without its unit, valid time, and source is incomplete.
4. Resident opens reviewed preparation guidance. Personal context may filter content only through an approved rule set.
5. Resident can view nearby facilities or begin a symptom report if already concerned.

**Success:** the resident can identify the area, the age and type of information, its limits, and an appropriate next navigation action. No claim about the user's actual lung condition is generated from outdoor data.

### Environmental Exceptions

| Condition | Required behavior |
| --- | --- |
| Location permission denied | Offer area search/manual selection; do not block the app. |
| No provider coverage | Say data is unavailable; do not substitute a distant area silently. |
| Provider timeout | Show an eligible cached reading with its original time and stale label, or no reading. |
| Forecast available, observation absent | Label forecast clearly; do not call it a live sensor measurement. |
| Coarse spatial grid | Explain regional resolution; do not imply street or household precision. |
| Unknown category mapping | Show supported raw information and an unavailable interpretation, not a guessed category. |

## Flow B: Report Symptoms from Home

1. Resident sees service availability and access to emergency guidance before entering the report flow.
2. Resident signs in to submit a private report. Emergency-access information remains reachable without registration.
3. Form collects the complaint in the resident's words, onset, progression, relevant history, and consent to share with the selected demo facility.
4. Optional photos can add context. The app does not infer lung status from a photo or require one to submit.
5. Resident previews the report and submits it. A persisted report ID confirms receipt, not clinical review.
6. A facility-scoped reviewer opens the report, requests clarification or publishes a follow-up instruction.
7. Resident receives an in-app update and can respond to a clarification request.
8. Staff may advise follow-up, further remote contact, or onsite assessment according to their professional role and the approved protocol.

The exact clinical fields and any emergency-screening rules are pending review. Missing a form flag must never be described as proof that staying home is safe. No automatic medication recommendation is part of this draft.

## Flow C: Onsite Examination and Results

1. Resident accesses facility details or follows professional advice to attend.
2. Facility verifies the patient's linkage to the Avela account through an agreed process. A typed name or client-supplied account ID alone is insufficient.
3. Staff creates a draft examination result associated with the report or verified encounter.
4. Authorized staff publishes it with authorship, facility, timestamp, and instructions.
5. Only the corresponding resident can read it. Later corrections are versioned and visible.

External hospital record exchange is not assumed. The initial demo can use a peer-owned simulated examination service after a contract is agreed.

## Proposed Case States

| State | Meaning | Allowed next state / actor |
| --- | --- | --- |
| `draft` | Not submitted; no staff attention implied | `submitted` by resident |
| `submitted` | Persisted in the selected facility queue | `in_review` by authorized staff; `cancelled` by resident |
| `in_review` | Claimed for review | `awaiting_information` or `responded` by reviewer |
| `awaiting_information` | Reviewer requested additional information | `in_review` after resident reply or reviewer action |
| `responded` | Published professional/simulated professional response exists | `closed` by staff; `in_review` on explicitly accepted follow-up |
| `closed` | Completed episode; retained according to policy | New concern creates a new linked report |
| `cancelled` | Resident withdrew before review | No silent reopening; new submission required |

Urgency, onsite referral, result publication, and review status are separate concepts. An onsite recommendation is a response disposition, not proof of arrival. A report becomes `responded` only when a published staff response exists. Concurrent state changes require version checks.

## Staff Availability

Staff interface must show the selected facility, queue, assignment, previous responses, and source timestamps. Residents must see opening hours or an explicit unknown status, whether the service is simulated, and that an unanswered submission is not continuous monitoring. Do not fabricate an SLA.

## Proposed Navigation

Resident tabs: **Home**, **Reports**, **Facilities**, **Account**. Stack screens: preparation guidance, report form, report detail, facility detail, examination result. Login is a separate entry flow. This provides more than four screens while retaining one main journey.

Operator delivery alternatives: role-gated screens in the same Expo app, or a small separate web console. The latter costs another deployment and testing surface; decide in Q-06.

## End-to-End Demo Scenario

Use a fictional adult in an explicitly synthetic pilot scenario. Show environmental context, submit a report, switch to a simulated staff account, request clarification, respond, and publish a fictional examination result. Then demonstrate an expired environmental reading, a peer API outage, a duplicate retry, and an unauthorized account attempting to access the result. Show which peer services supplied which feature data.
