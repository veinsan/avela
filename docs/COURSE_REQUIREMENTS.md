# TST and PWAM Coursework Requirements

**Source:** Supplied 28-page assignment deck; see [REFERENCES.md](REFERENCES.md), S-01. This is a reading of that deck, not a claim that course rules have not changed since publication.

## Mandatory Deliverables

| ID | Requirement | Source pages | Avela mapping / evidence needed |
| --- | --- | --- | --- |
| C-01 | Two members, backend/business and mobile responsibilities | 3-5 | Named role assignment pending; both understand the complete system |
| C-02 | DDD paper: description, bounded contexts, subdomain decomposition | 19 | DOMAIN_MODEL input; final formatted paper and cover still required |
| C-03 | Core microservice in Docker on publicly accessible STB | 20, 23 | Deployment, resource limits, endpoint evidence |
| C-04 | Provide documented API, peer keys, and test account | 14, 17 | OpenAPI/Postman, access instructions, synthetic account |
| C-05 | Consume services from at least two other groups in real features | 14, 21 | Two written agreements, feature mapping, logs/screenshots/video |
| C-06 | Integration outside STB, or in mobile application | 11, 21 | Architecture and deployment evidence |
| C-07 | React Native/Expo application; at least four screens, stack + tab, login, validated form | 22 | Installed release APK walkthrough |
| C-08 | ApiService.js calls own API and peer APIs directly or through integration | 22 | Required service boundary; resolve literal filename if using TypeScript |
| C-09 | Loading, error, empty, and peer-outage handling | 22 | Failure demonstrations and tests |
| C-10 | Jest unit tests plus functional and integration test table | 22 | Test outputs and PDF testing report |
| C-11 | Aplikasi_Release.apk via EAS, branded icon/splash, HTTPS | 22 | Downloadable/installable release artifact |
| C-12 | Backend repository and README.pdf; integration README.txt | 20-21, 26 | These Markdown docs are inputs, not substitutes for required formats |
| C-13 | Video on YouTube with both members presenting | 21, 26 | Explain services, integration, and responses to selected peer designs |
| C-14 | Final links submitted in Edunex; endpoints remain live for grading | 26 | Submission confirmation and availability check |

## DDD Paper Format

- System description: 4-8 paragraphs, each 5-6 sentences.
- Bounded contexts: 2-4 paragraphs, each 4-6 sentences.
- Subdomain decomposition: diagram plus 2-4 paragraphs, each 4-6 sentences; classify core/supporting/generic.
- Cover contains both members' identities; submit in an accepted document format.

The Markdown domain model does not yet satisfy the final paper's cover, paragraph, diagram, or selected-partner requirements.

## Dates in the Deck

| Milestone | Date / interval | Required outcome |
| --- | --- | --- |
| Week 12 | 9-15 November 2026 | Team, theme, domain, initial app structure planning |
| End of Week 13 | 22 November 2026 | DDD paper |
| End of Week 14 | 29 November 2026 | Public microservice base URL and documentation in API Registry |
| Week 15 | 30 November-6 December 2026 | Integration and end-to-end testing |
| Final | 13 December 2026, 23:59 WIB (UTC+7) | All final artifacts in Edunex |

The calendar end dates for Weeks 13/14 follow the deck's displayed week ranges. No separate time-of-day cutoff is stated for those milestones in the extracted requirements.

## STB and Access Constraints

Only microservice-related containers run on the STB. Set CPU and memory limits and restart policies. Do not run frontend, mobile builds, or AI models there. Keep credentials in untracked configuration and do not expose the database publicly. Use synthetic personal data.

K01 uses `namakelompok.stei.fun`; K02 uses `namakelompok.stei.site`. Reserve a unique 3-20 character lowercase/number/hyphen group name in the Registry. Avela's course class, registry reservation, and actual hostname are not confirmed.

The deck includes shared-access credentials. They are intentionally not copied into project documentation, source code, or examples.

## Integration and Authentication Nuance

Two public providers are not two student groups. Each selected peer must supply a meaningful feature, written endpoint/schema/rate-limit agreement, and evidence in both groups' README files. When a peer is late, the deck allows contract-based mocks and instructs reporting delays after Week 14; mock use must be explicit.

TST authentication/authorization is described as a bonus, while the mobile login and inter-group access arrangements are still required. Avela's private reports make access control part of the proposed product baseline regardless of bonus grading.

## Grading Caveat

The deck labels its weights as proposed. It lists TST DDD 25%, service/deployment 30%, integration 25%, documentation/video 20%, with an authentication bonus; PWAM functionality/integration 35%, usability 15%, code/testing 20%, branding/release/docs 15%, demo 15%. Follow later official course instructions if they supersede these values.
