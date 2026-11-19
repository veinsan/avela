---
version: 0.4
name: Avela
description: 'A calm resident companion: regional air context, a clear next step,
  and accountable care follow-up.'
colors:
  background: '#2B2D31'
  surface: '#33363B'
  surfaceContainer: '#3C3F45'
  text: '#D9DADC'
  textMuted: '#A9ACB1'
  outline: '#8B8E94'
  divider: '#46494F'
  focus: '#D9DADC'
  tonal: '#45484E'
  tonalPressed: '#50535A'
  selected: '#D9DADC'
  onSelected: '#2B2D31'
  accent: '#FFC93C'
  accentPressed: '#E8B42F'
  onAccent: '#2B2D31'
  information: '#9DC1F2'
  informationSurface: '#2E3A4B'
  warning: '#F2A65E'
  warningSurface: '#45372A'
  danger: '#FF9A9A'
  dangerSurface: '#4A2F33'
  disabledSurface: '#3A3C41'
  disabledText: '#ACAFB4'
typography:
  display:
    fontFamily: system
    fontSize: 56
    fontWeight: 700
    lineHeight: 60
  headline:
    fontFamily: system
    fontSize: 28
    fontWeight: 700
    lineHeight: 34
  title:
    fontFamily: system
    fontSize: 20
    fontWeight: 600
    lineHeight: 26
  body:
    fontFamily: system
    fontSize: 16
    fontWeight: 400
    lineHeight: 24
  bodyStrong:
    fontFamily: system
    fontSize: 16
    fontWeight: 600
    lineHeight: 24
  label:
    fontFamily: system
    fontSize: 14
    fontWeight: 600
    lineHeight: 20
  caption:
    fontFamily: system
    fontSize: 14
    fontWeight: 400
    lineHeight: 20
rounded:
  small: 8
  control: 14
  panel: 20
  sheet: 28
  pill: 999
spacing:
  xs: 4
  sm: 8
  md: 12
  lg: 16
  screen: 20
  xl: 24
  xxl: 32
  section: 40
components:
  buttonPrimary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.onAccent}'
    typography: '{typography.bodyStrong}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
    height: 52
  buttonPrimaryPressed:
    backgroundColor: '{colors.accentPressed}'
    textColor: '{colors.onAccent}'
  buttonTonal:
    backgroundColor: '{colors.tonal}'
    textColor: '{colors.text}'
    typography: '{typography.bodyStrong}'
    rounded: '{rounded.control}'
    height: 52
  buttonTonalPressed:
    backgroundColor: '{colors.tonalPressed}'
    textColor: '{colors.text}'
  buttonGhost:
    textColor: '{colors.text}'
    typography: '{typography.label}'
    height: 48
  buttonDanger:
    backgroundColor: '{colors.dangerSurface}'
    textColor: '{colors.danger}'
    typography: '{typography.bodyStrong}'
    rounded: '{rounded.control}'
    height: 52
  buttonDisabled:
    backgroundColor: '{colors.disabledSurface}'
    textColor: '{colors.disabledText}'
    height: 52
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.panel}'
    padding: '{spacing.screen}'
  conditionCard:
    backgroundColor: '{colors.surfaceContainer}'
    textColor: '{colors.text}'
    rounded: '{rounded.panel}'
    padding: '{spacing.xl}'
  listGroup:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.panel}'
  listRow:
    textColor: '{colors.text}'
    typography: '{typography.bodyStrong}'
    padding: '{spacing.lg}'
    height: 64
  field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
    height: 52
  fieldFocused:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
  chip:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '{spacing.md}'
    height: 44
  chipSelected:
    backgroundColor: '{colors.selected}'
    textColor: '{colors.onSelected}'
  segmentedTrack:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.control}'
    height: 48
  segmentedIndicator:
    backgroundColor: '{colors.tonal}'
    textColor: '{colors.text}'
    rounded: '{rounded.small}'
  statusPill:
    backgroundColor: '{colors.surfaceContainer}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '{spacing.sm}'
  bannerInfo:
    backgroundColor: '{colors.informationSurface}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  bannerWarning:
    backgroundColor: '{colors.warningSurface}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  bannerDanger:
    backgroundColor: '{colors.dangerSurface}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  exposurePanel:
    backgroundColor: '{colors.informationSurface}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  categoryChip:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '{spacing.sm}'
  tabBar:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
  skeleton:
    backgroundColor: '{colors.surfaceContainer}'
    rounded: '{rounded.small}'
---

## Overview

**Status:** Baseline for implementation (D-09). Updated 12 November 2026 for the exposure context, the community signal, and the staff screens; 17 November 2026 for the DDD paper (partner sections, facility directory, area list); and 20 November 2026 for the 60/30/10 palette chosen by the owner (D-36). The app in `apps/mobile` implements it; it has been opened on one phone, but the accessibility checks at the end of this file have not been run. The mobile theme module (`apps/mobile/src/theme/index.js`) mirrors the frontmatter; change a token here first.

The direction is a calm, dark personal health companion with the readability of a well-organized field guide: charcoal gray surfaces, silver text, a single yellow action per screen, and source/time information close to environmental values. Brand character comes from proportion, spacing, and precise language. It does not need smoke imagery, a medical mascot, gradients, glass effects, or a dashboard full of interchangeable cards.

The resident should understand three things in order: **what the available data says about the area, what they can do next, and whether a person has reviewed their report**. Environmental certainty, medical urgency, and report progress are separate visual signals.

This is a documentation-only refinement informed by [Impeccable](https://github.com/pbakaus/impeccable), especially its Operate and Android guidance. No launcher or rendering tool ran, no global skill was installed, and no UI exists to extract or visually certify. Existing PRD and PRODUCT_FLOWS provide product context. Detailed screen composition below remains a proposal, not evidence of usability testing.

## Colors

### The 60/30/10 Rule (D-36)

Two colors do 90% of the work and one color that does not quite match takes the last 10%, only on the action the user should press.

| Share | Color | Hex | Roles |
| --- | --- | --- | --- |
| 60% | Gray | `#2B2D31` | `background`, and its lighter steps `surface`, `surfaceContainer`, `tonal`, `divider` |
| 30% | Silver | `#D9DADC` | `text`, `focus`, `selected` (chosen chips), active tab, links, and its dimmer steps `textMuted`, `outline` |
| 10% | Yellow | `#FFC93C` | `accent`: the fill of the one primary button per screen, and nothing else |

The accent goes on **Masuk**, **Kirim laporan** (and its review step), **Klaim laporan**, **Terbitkan tanggapan**, **Tutup laporan**, **Terbitkan ke warga**, and the one leading action on Beranda. It never colors tabs, chips, links, text, icons, panels, headers, or status. Secondary actions use `tonal`, low-emphasis ones are text buttons in `text`, and a chosen chip inverts to `selected` with `onSelected` text plus a check mark. Squint test: on any screen, the only thing that stands out is the yellow button.

The palette is one dark scheme. The app does not switch to a light scheme with the system setting, because a light version would swap the 60% and 30% roles and lose the brand. Resolve roles through the theme module instead of placing literal colors in screens.

### Status Colors Outside the 60/30/10

Status needs its own hues, kept muted so they never compete with the yellow button, and always paired with text:

- `danger` (soft red) for Darurat and failed actions that block the user. Yellow is never used for danger, and danger is never used for a normal action.
- `warning` (soft orange, distinct from the yellow accent) for stale data and recoverable errors.
- `information` (soft blue) for neutral notices such as "Terkirim, belum ditinjau" and the exposure context.

Environmental information sits on a neutral `surfaceContainer` panel. It must not turn reassuring green because a pollution value is low, and it must never use the accent. A completed software action can use a check mark and text without implying medical safety.

### Semantic Mapping

| Meaning | Visual treatment | Required label |
| --- | --- | --- |
| Model forecast | Neutral condition panel, forecast icon | Prakiraan model plus area and valid time |
| Station observation | Neutral panel, observation icon | Pengukuran stasiun plus station and measured time |
| Stale or unavailable data | Warning or neutral unavailable panel | Explicit age or unavailable text; no low-risk badge |
| Report received, not reviewed | Information treatment | Terkirim / Belum ditinjau |
| Staff response available | Attributed response on a `surface` panel; the yellow goes only on the next action, if there is one | Tanggapan petugas plus author and time |
| Urgent-access information | Danger text/container with direct navigation | Approved action wording, independent of report queue |
| Synthetic service | Persistent small plain-language label | Simulasi tugas kuliah |
| Exposure context on a report | Information panel, forecast icon | Prakiraan wilayah, bukan dosis pribadi |
| Community signal | Plain caption row under the forecast | Jumlah laporan 7 hari, or Belum cukup data |
| PM2.5 category | Neutral chip with text; no traffic-light fill | Category name and "mengacu ISPU"; hidden while the label is null |

AQI colors and category names require a separate, named standard and review. Do not label US or European AQI as Indonesian ISPU. Raw PM2.5 concentration is not an AQI score. No invented health thresholds are encoded in this palette.

### Contrast and Non-Color Cues

Target at least 4.5:1 for normal text and 3:1 for large text and essential control boundaries. Outline identifies controls; divider is decorative and must not be the only field boundary. Use text, icon, and placement alongside color. Disabled controls retain a readable reason. Review theme pairs numerically and on-device; a token check alone does not certify accessibility.

Computed on 20 November 2026 (WCAG relative luminance): text on background 9.86:1, on surface 8.67:1, on surfaceContainer 7.55:1, on tonal 6.56:1; textMuted on background 6.06:1, on surfaceContainer 4.64:1; onAccent on accent 8.98:1, on accentPressed 7.23:1; accent against background 8.98:1; outline against background 4.20:1 and surface 3.69:1; information, warning, and danger on their surfaces 6.22, 5.67, and 5.92:1; danger on background 6.79:1; disabledText on disabledSurface 5.02:1.

## Typography

Use one platform system sans family. On Android, resolve through the native system face rather than downloading a display font. Avela is a task-oriented health interface; familiarity and legibility are deliberate choices. No decorative type appears in guidance, navigation, forms, or clinical results.

| Role | Use |
| --- | --- |
| display | One primary environmental value, never a disease probability |
| headline | Page purpose or the dominant condition heading |
| title | Major section heading or report title |
| body | Guidance, form content, staff responses, explanatory prose |
| bodyStrong | Primary actions and emphasis inside short summaries |
| label | Navigation and control labels |
| caption | Source, time, units, and other supporting metadata |

The proposed numbers map to React Native logical font values with system scaling enabled; web versions should convert to accessible rem sizing. Do not disable font scaling to preserve a layout. Use tabular numerals where supported for time-series values, but no monospace medical copy. Keep units adjacent to values, never as a faint corner annotation. Say a missing value in words, such as "tidak ada data" or "waktu tidak diketahui", never as zero and never as a bare dash.

Body text is left-aligned. Long guidance and responses wrap naturally; no fixed card height or truncation hides meaning. Metadata is at least caption size. Avoid uppercase paragraphs and letterspaced labels. Use Indonesian copy and locally understandable dates, explicitly showing the relevant zone; transport timestamps remain UTC.

## Layout

### Shared Spatial Rules

Use a single phone content column with `spacing.screen` (20) horizontal padding and `spacing.xl` (24) between sections. Reserve `spacing.section` for major changes in task, not every row. Align titles, values, and actions to a consistent left edge. Group related rows inside one `listGroup` with inset dividers instead of a card per row, and never nest a card inside a card.

Tab screens open with a large title block: the screen name in `headline`, an optional `caption` line under it, and the Darurat pill on the right. Stack screens use the native header in `surface` with no shadow, a silver title, and the system Back.

Honor safe areas, display cutouts, system navigation, and keyboard insets. All interactive targets are at least 48 by 48 logical units, with at least 8 units separation. Token height is a minimum baseline: controls expand under larger text settings. Keep essential information in the scrolling content rather than behind a floating action.

### Proposed Screen Composition

| Surface | Reading order | Primary action | Avoid |
| --- | --- | --- | --- |
| Home | Chosen area; environmental value and provenance; timeline; community signal; FlowGanic waste recap; preparation summary; latest report status | View preparation, or open latest staff response when one exists | Multiple equally dominant buttons, health score gauges, decorative full-screen maps |
| Reports | Availability banner; ongoing report; chronological history | Start a report when appropriate | Claiming unread/submitted reports are monitored |
| Report form | Purpose and availability; grouped questions; optional attachment; review and submit | Continue or send, one step at a time | Hiding required labels, resetting valid input on error |
| Report detail | Current state; latest attributed response; timeline; submitted information | Reply if information was requested, otherwise read follow-up | A progress bar suggesting guaranteed clinical resolution |
| Facilities | Area and service filter; simulation label; readable list with services and schedule | Open facility details | Inferring capacity from a map marker or sorting as a guaranteed referral |
| Examination result | Identity context; facility/author/date; result; next steps; version history when corrected | View the relevant next step | Automatically generated diagnosis presented as signed care |
| Account | Profile, chosen area, privacy and session controls | Contextual save | Decorative statistics unrelated to care |
| Queue (staff) | Facility name; state filter; reports oldest first with state and waiting time | Open a report | Color-only urgency, sorting that hides old reports |
| Review (staff) | State; complaint; exposure context; timeline; action area | The one action valid for the current state | Showing respond and close together; hiding who claimed the report |
| Publish result (staff) | Linked report and resident name; result text; preview | Publish | Publishing without a preview |

Keep environmental data readable without signing in. Private reports and results require authentication. Preparation and urgent-access navigation must not be hidden by a permission request or mandatory onboarding carousel.

### Navigation and Adaptation

Compact width uses four labeled destinations for residents: Beranda, Laporan, Fasilitas, Akun. A staff account gets two: Antrean and Akun. Each tab has an outline icon above its label; the active tab switches to the filled icon and silver text on the gray bar, and inactive tabs use `textMuted`. The Laporan tab shows a count badge for update markers. Tabs never use the yellow accent. The role from the session decides which set is shown; the two sets never mix. Detail screens use a contextual top app bar and native Back behavior; Android system Back must work. Avoid a permanent floating button that duplicates the screen's primary action.

At medium width (proposed 600-839 logical units), consider a navigation rail and preserve comfortable reading measure. At expanded width (840+), a staff queue may use master/detail panes if that surface is approved. Do not stretch paragraphs across the whole display. Width thresholds are implementation proposals to test, not evidence of tablet support.

### Environmental Timeline

Show the next six hours as a row of vertical bars, each with its time and value in text, the current hour first in `text` and later hours in `outline`. The row carries an accessibility label that reads the hours as a list. Break the line at missing samples. No smooth curve or confidence band unless supported by data. A selected time displays its exact value and valid time. Forecasts remain separate from station observations; changing the source must be visible.

## Elevation & Depth

Use tonal surfaces and clear grouping first. Ordinary rows do not need shadows. A modal sheet may use native elevation to communicate a temporary layer; its backdrop must not obscure the current task's meaning. Avoid floating, stacked, translucent panels.

Motion runs on the UI thread with Reanimated and is functional, never decorative. Each case below names its purpose:

| Moment | Motion | Purpose |
| --- | --- | --- |
| Any press | Scale to 0.97 in 120 ms, `ease-out` (cubic-bezier 0.23, 1, 0.32, 1) | Feedback |
| Segmented control | Indicator slides to the chosen option in 250 ms, ease-in-out; one selection haptic | Spatial consistency |
| A list or card the user waited for (reports, queue, facilities, the condition card) | Fades up 8 units in 250 ms, rows staggered by 40 ms, only on first load | Preventing a jarring change |
| Banner that appears after an action (sent, conflict, error) | Fades up in 250 ms | State indication |
| Skeleton while loading | Opacity 0.55 to 1 and back over 1.6 s | State indication |
| Report sent, response published, result published | Success haptic in the same frame as the screen change | Feedback |
| Tab switch | None | Used too often to animate |
| Screen push, modal, sheet | The native stack default | Platform behavior |

With reduced motion on, entrances and the skeleton pulse are skipped, the indicator jumps, and screens fade instead of sliding. Haptics are never the only feedback. No smoke particles, animated risk counters, page-load choreography, or endless pulsing urgency.

Loading uses stable skeleton regions for initially absent content. A refresh preserves the last source-attributed content and shows a small updating indicator. Use a spinner only for a localized action in progress, not as a blank full-screen experience.

## Shapes

Small radius belongs to skeleton bars and the segmented indicator. Control radius (14) is shared by inputs, buttons, and banners. Panel radius (20) is for cards, list groups, and the condition card. Sheet radius applies to temporary surfaces. Pill radius is for chips, status pills, and the Darurat pill. Avela's visual signature is the spacious condition summary paired with a concise, plainly attributed next step, not a repeated rounded-card grid.

Use Ionicons from `@expo/vector-icons`, outline style, 20 to 24 units, in `text` or `textMuted`; the filled variant marks the active tab only. Familiar symbols support labels rather than replacing them. No emoji as clinical status icons, no fake hospital logos, and no photography suggesting a partner or staff member who does not exist.

## Components

Every contract below is implemented in `apps/mobile/src/components/`. Use these components instead of styling a screen by hand.

### Building Blocks

| Component | Use |
| --- | --- |
| `Button` | `primary` (yellow, one per screen), `tonal` (secondary), `ghost` (low emphasis), `danger` (destructive or emergency). Optional leading icon. 52 units high. |
| `Card` | One distinct object: the condition summary, a staff response, a result. |
| `ListGroup` and `ListRow` | Rows of the same kind (reports, facilities, settings) inside one surface with inset dividers. A row has an optional leading icon, a title, a subtitle, trailing meta, and a chevron when it opens something. |
| `Chip` | One choice among a few (course of symptoms, facility, disposition). The chosen chip inverts to `selected` with a check icon. |
| `Segmented` | Two to four filters over one list (area filter, queue state). |
| `StatusPill` | A report state in words with its icon. `awaiting_information` uses the warning tone because the resident must act; the others stay neutral. |
| `Banner` | Info, warning, or danger notice with an icon, a title, a sentence, and an optional action. |
| `Skeleton` | Gray bars in the shape of the content that is loading. |
| `EmptyState` | An icon, one sentence on what appears here, and the action that fills it. |

### Environmental Summary

Include area, data kind, pollutant, unit, valid time, source, and freshness near the primary value. Put resolution details behind an accessible explanation, with a short visible regional qualifier. Do not use generationtime_ms as an issue timestamp. A missing issue time stays unknown. A station reading needs its station identity; the nearest station is not necessarily representative of the user.

### Category Chip and Community Signal

`categoryChip` sits beside the PM2.5 value and carries the category name in text. It has an outline in the outline role, a `surfaceContainer` fill, and no status color, so the category never reads as a personal risk level. It is not rendered while the category is null.

The community signal is one caption-size row under the forecast: the 7-day report count for the area and the words "data simulasi" in the coursework build. A hidden count reads "Belum cukup data". It is never a chart, a map, or a trend arrow.

### Exposure Context

`exposurePanel` appears in report detail for both the resident and the reviewer. It shows mean and peak PM2.5 with units, the window start and end in local time, the source, and the fixed label "Prakiraan wilayah, bukan dosis pribadi". When the context is missing, the panel says "Konteks paparan tidak tersedia" and gives no numbers. It never uses warning or danger colors: it is context for the reviewer, not a verdict.

### Staff Queue and Review

Each queue row shows the complaint's first line, a `StatusPill`, how long the report has waited, and who claimed it. Rows sit in one `ListGroup`, not in separate cards. The review screen shows exactly one primary action for the current state: claim, then ask or respond, then close. A version conflict shows an inline message and reloads the report. Every staff screen carries the "Simulasi tugas kuliah" label.

### Guidance and Next Step

Use a short heading and a small number of readable actions, linking to the fuller reviewed source. Show review status where appropriate. A preparation link and a symptom-report link serve different needs; do not turn the latter into an automated diagnosis promise. Exact clinical wording requires review and remains outside this visual specification.

Protective products from Veriqu sit below the guidance text, never above it. Each shows the product name, the rating summary in text, and "Sumber: Veriqu". They are catalogue entries, not prescriptions, and the section disappears into one unavailable line when Veriqu is down.

### Partner Environment Section

FlowGanic's waste recap is a short list on Beranda below the community signal: waste type and managed volume with its unit, the period, and "Sumber: FlowGanic". It uses no status color and makes no claim about smoke or health.

### Form and Attachment

Attachments are a stretch item (A-11); the attachment rules below apply only if it is built.

Use persistent labels, optional markers, inline errors, preserved values, and a clear submission preview. On invalid submission focus the first invalid field and expose its message to assistive technology. File type/size limits must be visible before selection. Failed uploads show retry/remove actions. Screen-reader reading order follows the form, including validation and attachment status.

### Buttons and Inputs

| State | Required behavior |
| --- | --- |
| Default | Clear label, consistent shape, sufficient target and contrast |
| Pressed | Tonal change without changing geometry |
| Focus | Visible outline and accessible focus order on keyboard-capable surfaces |
| Hover | Only on pointer surfaces; never the only way to reveal information |
| Disabled | Reason visible; no invisible controls or unreadable text |
| Loading | Preserve action label, prevent duplicate taps, announce progress |
| Error | Actionable inline message, retain input, offer an appropriate retry |

Use the yellow filled button for the current primary action, a `tonal` button for a secondary action, and a silver text action for low-emphasis navigation. A screen has at most one yellow button; never put two side by side. A destructive confirmation (such as "Ya, batalkan") uses the danger container, not yellow. Input outline uses the outline role; focus uses the focus role. These border/state rules live in prose rather than invalid custom component token properties.

### Report Timeline and Staff Response

Distinguish submitted, in review, awaiting information, responded, and closed. The timeline is a vertical line with one node per event; staff events and resident events use different icons. Each event shows author type and time. The published response is visually stronger than audit details. Do not use a green completed check to mean the resident is healthy. Resident comments and professional responses must not share an ambiguous author treatment. Simulation labels remain visible.

### Facility List

Show facility name, relevant services, area, and opening schedule. Separate unknown opening status from closed. The directory is simulated (D-24), so the list carries the simulation label. No distance, map, or route ranking: the app does not know the resident's location (D-25).

### Copy and Failure States

| Situation | Proposed Indonesian copy / behavior |
| --- | --- |
| Submitted | Laporan terkirim. Belum ditinjau petugas. |
| Provider unavailable | Data kualitas udara belum tersedia. Coba lagi nanti. |
| Cached reading | Data tersimpan, with original valid time and source |
| Forecast context | Prakiraan model untuk wilayah ini, not a sensor claim |
| Staff unavailable | Layanan peninjauan sedang tidak tersedia. |
| No reports | Belum ada laporan. Explain what submitting does before offering the action. |
| Partner data unavailable | Data mitra sedang tidak tersedia. |
| Demo | Simulasi tugas kuliah, not a clinical service promise |

Do not display reassuring medical copy as a default empty state. A successful submit toast is supplementary; the persistent report state provides evidence. Existing results remain readable when an unrelated public API fails.

## Do's and Don'ts

- Preserve the distinction between environmental evidence, personal symptoms, and professional assessment.
- Make source, valid time, and unanswered-review state easy to find.
- Use the theme and typography roles consistently across the two resident journeys.
- Keep facility lists, large text, keyboard/Back behavior, and offline/error states first-class.
- Avoid generic metric tiles, gradients, glass, decorative maps, 3D lungs, or an invented Avela health score.
- Never use weather icons or sky color as a pollution measurement.
- Write app text as full sentences or short labels. No semicolons, no bullet characters (•), no em dashes, and no emoji; split a list into rows or chips instead.
- Do not claim the palette or this document has passed a rendered accessibility audit.

Before UI completion, capture an actual Android build at compact width, large text (including a 200% stress check where supported), outdoor brightness (the dark palette must stay readable in sunlight), keyboard-open form, missing environmental data, long staff response, and a failed upload. Run the squint test on every screen: only the yellow button should stand out. Include TalkBack checks. Add tablet evidence only if tablet support is claimed. Browser mockups do not prove native behavior.
