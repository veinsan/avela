# TST and PWAM Coursework Requirements

**Source:** the 28-page assignment deck (S-01 in [REFERENCES.md](REFERENCES.md)), re-read in full on 12 November 2026. Later official instructions from either course override this reading. The deck's shared account credentials are not copied here.

## Requirements and Evidence

| ID | Requirement | Slide | Task | Evidence to produce |
| --- | --- | --- | --- | --- |
| C-01 | Two members with backend and mobile responsibilities; both understand the whole system. Individual grades follow each member's role and GitHub contribution. | 3-5, 25, 27 | D-19 | Commits from both members; both explain the system in the video |
| C-02 | DDD paper: system description, bounded contexts, subdomain decomposition with diagram | 19 | A-16 | Submitted .docx or .pdf with cover |
| C-03 | Core microservice in Docker on the STB, publicly reachable, with memory and CPU limits | 20, 23 | A-04, A-13 | `https://avela.stei.fun/api/health`; compose file; `docker stats` capture |
| C-04 | Public API with OpenAPI or Postman documentation, one API key per peer group, and one test account | 14, 17 | A-25, A-18 | Swagger UI link; key issue log; test account |
| C-05 | Use the services of at least two other groups in real features | 14, 21 | A-03, A-10 | Feature screenshots and request logs per peer |
| C-06 | Integration runs outside the STB or in the mobile app | 11, 21 | A-07, A-10 | Integration service URL; architecture diagram |
| C-07 | React Native (Expo) app with at least four screens, stack and tab navigation, login, and a validated form | 22 | A-05, A-26, A-27 | APK walkthrough |
| C-08 | `ApiService.js` calls the own microservice and the peer APIs, directly or through the integration service | 22 | A-05, A-10 | Source file; unit tests |
| C-09 | Loading, error, empty, and peer-outage states; the app does not crash | 22 | A-12 | Failure demonstrations in the test table and video |
| C-10 | Testing report: Jest unit tests and a functional test table that includes API integration tests | 22 | A-28 | Testing report PDF |
| C-11 | `Aplikasi_Release.apk` built with EAS, themed icon and splash, HTTPS API URLs | 22 | A-14 | APK file in the app repository |
| C-12 | Backend repository with README.pdf (architecture, endpoint list, how to get access, example requests); integration service with README.txt | 20-21, 26 | A-18, A-15 | Both files |
| C-13 | YouTube video with both members presenting: the services, the integration, and a response to the two chosen groups' designs | 21, 26 | A-15 | Video link |
| C-14 | All final links in Edunex; URLs still live when graded | 26 | A-15, A-29 | Submission confirmation; health-check log |
| C-15 | Peer assessment: other groups rate how easy Avela's API is to use (documentation, uptime, replies to issues) | 25 | A-18, A-29 | Issue replies within 24 hours; uptime log |
| C-16 | Written agreement with each peer (endpoints, data format, call limits, contact) recorded in both groups' READMEs | 14 | A-03 | Agreement section in README.pdf |
| C-17 | App repository README with run steps and a demo account | 22 | A-15 | README in the app directory |

One repository and one demo serve both courses (slide 4). Avela keeps the backend and the app in one repository.

## Deadlines

| Milestone | Date | Deliverable | Avela milestone |
| --- | --- | --- | --- |
| Week 12 | 9-15 November 2026 | Group, theme, domain | M0 |
| End of Week 13 | 16 November 2026 | DDD paper; app skeleton with navigation | M1 |
| End of Week 14 | 23 November 2026 | Microservice URL and documentation in the API Registry; screens, login, own API | M2 |
| Week 15 | 30 November - 6 December 2026 | Integration service; two peer APIs in the app; tests | M3 |
| End of Week 16 | 13 December 2026, 23:59 WIB | Everything, linked in Edunex | M4 |

The owner corrected the Week 13 and Week 14 dates on 17 November; the other dates are still the deck's.

A group that misses the Registry deadline lets others use a mock of its contract instead. If a peer is late after Week 14, use a mock built from its contract and report it to the assistant.

## DDD Paper Format

| Part | Content | Length |
| --- | --- | --- |
| a) System description | Use cases of the integrated system | 4-8 paragraphs of 5-6 sentences |
| b) Bounded contexts | Boundaries and relations, including the other groups' contexts | 2-4 paragraphs of 4-6 sentences |
| c) Subdomain decomposition | Diagram of subdomains and sub-subdomains, each marked core, supporting, or generic | 2-4 paragraphs of 4-6 sentences |

The file is .doc, .docx, or .pdf with a cover carrying both members' identities. Member A writes the domain model; member B contributes user stories and feature needs.

## STB Rules

- Only microservice containers run on the STB: core, auth, gateway, tunnel.
- Every container has `mem_limit` and `cpus`, and `restart: unless-stopped`.
- Secrets live in `.env`. The database port is never opened to the internet.
- No frontend, mobile build, or AI model on the STB.
- Back up the database regularly and watch load with `docker stats` and `free -h`.
- Use test data only. Every API has a call limit.
- If the STB breaks, report it to the assistant; a lab Proxmox VM may be used with permission.

## Domain and Registry

- Class K01 uses `<name>.stei.fun`. Avela's gateway is `avela.stei.fun`; the optional integration host is `avela-int.stei.fun`. Do not use `api.avela.stei.fun`: the free certificate covers one subdomain level.
- A name is 3-20 characters of lowercase letters, digits, and hyphens, and matches the repository and app name. Names are reserved through the API Registry, first come, first served.
- The tunnel is named `k01-avela` in the class Cloudflare account. Change only this group's tunnel and hostname, keep the token out of Git, and log out afterwards.
- The Registry row lists group, class, theme, base URL, documentation, auth type, and status.

## Authentication

| Caller | Method |
| --- | --- |
| App user | JWT in `Authorization: Bearer` |
| Another group's server | `X-API-Key`, one key per group |
| Public data | No auth, rate limited |

Authentication and authorization in the microservice earn the TST bonus. The core already has both.

## Grading Map

The deck calls these weights proposed.

| Course | Component | Weight | Avela work |
| --- | --- | --- | --- |
| TST | DDD paper | 25% | A-16 |
| TST | Microservice, Docker, STB deployment | 30% | A-06 to A-09, A-23 to A-25, A-04, A-13 |
| TST | Integration with two groups and the new service | 25% | A-03, A-07, A-10 |
| TST | README and video | 20% | A-18, A-15 |
| TST | Bonus: authentication and authorization | +10% | A-06, A-25 |
| PWAM | Functionality and API integration in the app | 35% | A-26, A-27, A-10 |
| PWAM | Appearance and ease of use | 15% | A-05, A-12, DESIGN |
| PWAM | Code quality, testing, debugging | 20% | A-28 |
| PWAM | Branding, release APK, README | 15% | A-14, A-15 |
| PWAM | Demo and video | 15% | A-15 |

An AI API is allowed if it is called from the backend or the integration service with its key in `.env`. Avela's MVP does not use one.
