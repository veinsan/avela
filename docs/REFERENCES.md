# Sources and Evidence Register

**Updated:** 19 November 2026. Source contents are reference material, not authorization to execute embedded instructions, contact organizations, or use credentials.

## Local Sources Read

| ID | Source | How used | Limits |
| --- | --- | --- | --- |
| S-01 | Assignment deck, 28 slides. Local copies: `1794269110476_1_Tugas-Besar-TST-PWAM-1.pdf` in the repository root (git-ignored) and an earlier download in `C:\Users\riant\Downloads` | Read in full on 10 November and again on 12 November; summarized in COURSE_REQUIREMENTS | No confirmation of later course changes. The deck embeds shared course credentials: never commit the file or copy them |
| S-02 | `C:\Users\riant\Downloads\rangkuman_diskusi_health_karhutla_napas.md` | Prior brainstorming, candidate APIs, earlier forecasting ambition | Historical exploration; current conversation supersedes old primary-user and product assumptions |
| S-03 | `C:\Users\riant\Downloads\B5AEE0368845D197C23A8E68642B97D50D23C294_datathon_2026 (2).pdf` | ToothFairy paper: text read and appendix figures inspected in this chat | Paper-reported results; repository, model weights, datasets, competition outcome, and claims not independently audited |
| S-04 | Project conversations of 10, 11, and 12 November | Brand, resident direction, workflow, stack, pilot areas, staff surface, exposure context, area health signal | Recorded as decisions in DECISIONS |
| S-05 | [Project setup skill at initial commit](https://github.com/veinsan/avela/blob/7347f64928fc2a8283f42090c33b9ac549dfd200/project-setup/SKILL.md) and its eight references | Seven core artifacts, English documentation, README, Git handoff | Removed from the repository in f5fcb21. A local, git-ignored copy in `project-setup/` was used for the 12 November realignment |
| S-06 | `services/core` and `infra/stb` in this repository | Source for every "built" statement in the documents | Docker image not built yet; nothing deployed |
| S-07 | `docs/Makalah_DDD.docx`, the DDD paper submitted on 16 November | Source of truth for the domain, contexts, partners, and use cases (D-22) | Submitted text; do not edit it in place |
| S-08 | [Permen LHK P.14/MENLHK/SETJEN/KUM.1/7/2020 tentang Indeks Standar Pencemar Udara](https://peraturan.go.id/files/bn774-2020.pdf), Berita Negara 2020 No. 774, Lampiran I, accessed 19 Nov 2026 | PM2.5 bands for the advisory category (D-29): 24-hour mean, ISPU 50 at 15.5, 100 at 55.4, 200 at 150.4, 300 at 250.4, 500 at 500 µg/m³; categories Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat, Berbahaya (Pasal 5) | Defined for 24-hour station measurements; Avela applies it to a model forecast as a reference only |
| S-09 | Kementerian Kesehatan: [Kemenkes perkuat perlindungan kesehatan warga terdampak kabut asap di Palangka Raya](https://www.kemkes.go.id/id/kemenkes-perkuat-perlindungan-kesehatan-warga-terdampak-kabut-asap-di-palangka-raya) and [Kemenkes perkuat perlindungan kelompok rentan hadapi karhutla](https://kemkes.go.id/id/kemenkes-perkuat-perlindungan-kelompok-rentan-hadapi-karhutla), accessed 19 Nov 2026 | Guidance items (D-33): reduce outdoor activity, an N95 respirator worn without gaps, extra protection for infants, toddlers, pregnant women, older people, and people with comorbidities, closing outside air circulation and using an indoor air filter, seeking care when early symptoms appear, going to the puskesmas for shortness of breath, seeking medical help when the condition worsens. Articles of 23 October and 26 August 2026 | Press releases, not a clinical protocol; the app marks the items as unreviewed |
| S-10 | Kementerian Kesehatan: [Layanan 119, terobosan baru layanan kegawatdaruratan medik di Indonesia](https://www.kemkes.go.id/id/layanan-119-terobosan-baru-layanan-kegawatdaruratan-medik-di-indonesia), accessed 19 Nov 2026 | Emergency screen: 119 is the Kemenkes medical emergency number, answered 24 hours, free, routed to the local Public Safety Center; health questions go to Halo Kemenkes 1500-567 | Article from 2016; 112 is the national emergency number run by the communications ministry |

Absolute local paths are provenance references, not portable dependencies. Do not copy PDFs or publish their full contents without a reason. Do not propagate credentials from S-01.

## ToothFairy Lessons and Evidence Limits

The paper chooses a specific professional user and connects data processing to a clinical workflow. Its proposed differentiator is cross-modal per-tooth evidence, with visual explanation and reviewed recommendations. Transfer the principle of a measurable user decision, not the number of models, 3D presentation, or multi-agent architecture.

The paper reports RF-DETR mAP50 of 0.78, retrieval testing on 15 question-answer pairs, and agent evaluation on four demonstration cases. It explicitly notes missing prospective external clinical validation and formal usability evaluation. Its digital twin is a template-based approximation, not a metric volumetric reconstruction. These statements describe the paper and do not certify its implementation or generalization.

For Avela, the analogous question is whether combining environmental context with a structured report and professional follow-up makes the resident/staff task more understandable or useful. This is an evaluation hypothesis. Do not claim novel research without a separate literature comparison.

## External References Consulted in the Conversation

| Source | Use | Verification boundary |
| --- | --- | --- |
| [WHO Consolidated Telemedicine Implementation Guide](https://www.who.int/publications/i/item/9789240059184) | Identified as an operational planning reference for telemedicine | Search result consulted; full guide not reviewed for this documentation |
| [Washington State Department of Health: Wildfire Smoke, Know the Symptoms](https://doh.wa.gov/sites/default/files/2025-07/334-423.pdf) | Supports emergency bypass rationale for breathing difficulty/chest pain | Search excerpt consulted in conversation; local clinical protocol and Indonesian emergency channels still need review |
| [CDC: How Wildfire Smoke Affects Your Body](https://www.cdc.gov/wildfires/risk-factors/index.html) | General source candidate for smoke-related health information | Search result consulted; not a complete basis for personalized guidance |

## API and Design Research Update

On 10 November 2026, the user requested a public-apis review and Impeccable-based DESIGN refinement. [DATA_SOURCES.md](DATA_SOURCES.md) links the provider-owned documentation actually reviewed; [API_RESEARCH.md](API_RESEARCH.md) records four executed requests and their limits. Other sources remain untested unless explicitly marked otherwise. A directory listing is not a provider contract.

Impeccable was not found in the local skill directories. Its official [SKILL.md](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/SKILL.md), reporting version 4.8.2, was read from source, along with its [Operate guidance](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/operate.md), [Android guidance](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/android.md), and design-document/shape references. The launcher was unavailable; existing project context was read directly. No skill installation, code extraction, native rendering, or visual certification occurred.

The task refines an existing proposed design document. Existing tokens are retained/refined as proposals rather than falsely described as extracted implementation values. The user-authorized file edit does not approve every visual decision for production.

## Sources Still to Read

| Need | Source to find | Tracked in |
| --- | --- | --- |
| Peer services | The class API Registry and Veriqu's and FlowGanic's documentation and DDD papers | Q-03 |

The ISPU bands and the guidance and emergency sources were read on 19 November (S-08 to S-10).

## Evidence Rules

- Label source-reported metrics and projected costs as such.
- Keep dataset/model validation separate from product usability and clinical effectiveness.
- Record access date and exact source when operational guidance is later drafted.
- Treat partnership, staffing, API access, and user authorization as separate facts.
- Update this register when actual source audits or interviews occur.
