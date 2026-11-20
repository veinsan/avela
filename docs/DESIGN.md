---
version: 0.5
name: Avela
description: 'A calm resident companion: regional air context, a clear next step,
  and accountable care follow-up.'
colors:
  background: '#FFFFFF'
  surface: '#F4F7F8'
  surfaceContainer: '#E9F0F3'
  text: '#16252D'
  textMuted: '#52626B'
  outline: '#7A8A93'
  divider: '#E3E9EC'
  focus: '#16252D'
  tonal: '#E9EEF1'
  tonalPressed: '#DCE3E7'
  selected: '#16252D'
  onSelected: '#FFFFFF'
  accent: '#FFC23D'
  accentPressed: '#F2B01E'
  onAccent: '#16252D'
  accentSoft: '#FFF3CC'
  accentWash: '#FFF8E5'
  information: '#1F5F99'
  informationSurface: '#EAF2FA'
  warning: '#8A4B00'
  warningSurface: '#FFF2DF'
  danger: '#B3261E'
  dangerSurface: '#FDECEA'
  dangerPressed: '#F9D9D5'
  good: '#1E6B3A'
  goodSurface: '#E6F4EA'
  disabledSurface: '#EEF1F3'
  disabledText: '#5E6C74'
typography:
  display:
    fontFamily: Bricolage Grotesque
    fontSize: 64
    fontWeight: 600
    lineHeight: 68
    letterSpacing: -2
  headline:
    fontFamily: Bricolage Grotesque
    fontSize: 30
    fontWeight: 600
    lineHeight: 36
    letterSpacing: -0.6
  title:
    fontFamily: Bricolage Grotesque
    fontSize: 21
    fontWeight: 600
    lineHeight: 27
    letterSpacing: -0.3
  body:
    fontFamily: Onest
    fontSize: 16
    fontWeight: 400
    lineHeight: 24
  bodyStrong:
    fontFamily: Onest
    fontSize: 16
    fontWeight: 600
    lineHeight: 24
  label:
    fontFamily: Onest
    fontSize: 14
    fontWeight: 500
    lineHeight: 20
  caption:
    fontFamily: Onest
    fontSize: 14
    fontWeight: 400
    lineHeight: 20
rounded:
  small: 10
  control: 14
  panel: 24
  sheet: 28
  pill: 999
spacing:
  xs: 4
  sm: 8
  md: 12
  lg: 16
  xl: 24
  xxl: 32
  section: 40
  gutter: 20
components:
  buttonPrimary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.onAccent}'
    typography: '{typography.bodyStrong}'
    rounded: '{rounded.control}'
    padding: '{spacing.xl}'
    height: 52
  buttonPrimaryPressed:
    backgroundColor: '{colors.accentPressed}'
    textColor: '{colors.onAccent}'
  buttonTonal:
    backgroundColor: '{colors.tonal}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    height: 52
  buttonDisabled:
    backgroundColor: '{colors.disabledSurface}'
    textColor: '{colors.disabledText}'
    height: 52
  conditionPanel:
    backgroundColor: '{colors.surfaceContainer}'
    textColor: '{colors.text}'
    rounded: '{rounded.panel}'
    padding: '{spacing.xl}'
  field:
    backgroundColor: '{colors.surface}'
    borderColor: '{colors.divider}'
    focusBorderColor: '{colors.focus}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  warningPanel:
    backgroundColor: '{colors.warningSurface}'
    textColor: '{colors.warning}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  urgentPanel:
    backgroundColor: '{colors.dangerSurface}'
    textColor: '{colors.danger}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  exposurePanel:
    backgroundColor: '{colors.informationSurface}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '{spacing.lg}'
  categoryChip:
    backgroundColor: '{colors.goodSurface}'
    textColor: '{colors.good}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '{spacing.sm}'
  queueRow:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    padding: '{spacing.lg}'
---

## Overview

**Status:** Baseline for implementation (D-09), now the light "udara terang" redesign (D-37, 20 November 2026), which supersedes the dark palette of D-36. Earlier updates: 12 November (exposure context, community signal, staff screens) and 17 November (the DDD paper: partner sections, facility directory, area list). `apps/mobile` implements it and has been opened on one phone; the accessibility checks at the end of this file have not been run. The mobile theme module (`apps/mobile/src/theme/index.js`) mirrors the frontmatter; change a token here first.

The direction is a calm, light personal health companion: the app is the clear patch in the haze. White paper and cool mist surfaces, slate ink text, a single sun-yellow action per screen, and source and time information close to environmental values. The signature element is the condition panel on Beranda: the PM2.5 value set large in Bricolage Grotesque on a mist panel, with the next hours drawn as a row of columns where a missing hour stays an empty dashed slot. Brand character comes from proportion, spacing, and precise language. It does not need smoke imagery, a medical mascot, gradients, or a dashboard full of interchangeable cards. Glass appears in one place only: the floating tab bar.

The resident should understand three things in order: **what the available data says about the area, what they can do next, and whether a person has reviewed their report**. Environmental certainty, medical urgency, and report progress are separate visual signals.

The visual language was drawn in Figma and then built in `apps/mobile` (D-37); the 3D clay icons and the spot illustrations come from that Figma file. PRD and PRODUCT_FLOWS give the product context. The screen composition below describes the built layout; it is not evidence of usability testing.

## Colors

### The 60/30/10 Rule (D-37)

Two colors do 90% of the work and one color that does not quite match takes the last 10%, only on the action the user should press.

| Share | Color | Hex | Roles |
| --- | --- | --- | --- |
| 60% | White and mist | `#FFFFFF` | `background`, and its cool mist steps `surface`, `surfaceContainer`, `tonal`, `divider` |
| 30% | Slate ink | `#16252D` | `text`, `focus`, `selected` (chosen chips), active tab, links, icons, and its softer steps `textMuted`, `outline` |
| 10% | Sun yellow | `#FFC23D` | `accent`: the fill of the one primary button per screen, and nothing else (the illustrations' sun shares the hue) |

Two soft steps of the same yellow carry warmth without competing with the button (D-37): `accentSoft` marks where the user is (the active-tab pill, icon tiles, the avatar) and `accentWash` is the morning band behind the top of Beranda and Masuk and behind empty-state illustrations. The full `accent` also appears in two decorative places that never carry meaning: the sun-and-haze mark (a sun disc crossed by haze bands, echoing the logo's crossbar) and the bar for the current hour in the forecast strip, which is highlighted by position, not by its value.

The accent goes on **Masuk**, **Kirim laporan** (and its review step), **Klaim laporan**, **Terbitkan tanggapan**, **Tutup laporan**, **Terbitkan ke warga**, and the one leading action on Beranda. It never colors tabs, chips, links, text, icons, panels, headers, or status. Secondary actions use `tonal`, low-emphasis ones are text buttons in `text`, and a chosen chip inverts to `selected` with `onSelected` text plus a check mark. Squint test: on any screen, the only thing that stands out is the yellow button.

The palette is one light scheme. The app does not switch to a dark scheme with the system setting. Resolve roles through the theme module instead of placing literal colors in screens.

### Status Colors Outside the 60/30/10

Status needs its own hues, kept muted so they never compete with the yellow button, and always paired with text:

- `danger` (soft red) for Darurat and failed actions that block the user. Yellow is never used for danger, and danger is never used for a normal action.
- `warning` (soft orange, distinct from the yellow accent) for stale data and recoverable errors.
- `information` (soft blue) for neutral notices such as "Terkirim, belum ditinjau" and the exposure context.
- `good` (soft green) only for the ISPU category Baik on the category chip (D-38).

The condition panel itself stays neutral and never uses the accent. Only the category chip carries a category color (D-38), and green there means the ISPU category Baik and nothing else: never a personal all-clear. A completed software action can use a check mark and text without implying medical safety.

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
| PM2.5 category | Chip filled in its ISPU category color, always with text (D-38) | Category name and "mengacu ISPU"; hidden while the label is null |

Category colors follow the ISPU convention (S-08): Baik green, Sedang blue, Tidak Sehat yellow shown as the `warning` amber because sun yellow belongs to the primary button, Sangat Tidak Sehat red, Berbahaya black shown as ink. Any other standard needs its own review. Do not label US or European AQI as Indonesian ISPU. Raw PM2.5 concentration is not an AQI score. No invented health thresholds are encoded in this palette.

### Contrast and Non-Color Cues

Target at least 4.5:1 for normal text and 3:1 for large text and essential control boundaries. Outline identifies controls; divider is decorative and must not be the only field boundary. Use text, icon, and placement alongside color. Disabled controls retain a readable reason. Review theme pairs numerically and on-device; a token check alone does not certify accessibility.

Computed on 20 November 2026 for D-37 (WCAG relative luminance): text on background 15.71:1, on surfaceContainer 13.63:1, on tonal 13.44:1; textMuted on background 6.33:1, on surface 5.88:1, on surfaceContainer 5.49:1; onAccent on accent 9.75:1, on accentPressed 8.23:1; outline against background 3.57:1 and surface 3.32:1; information, warning, and danger on their surfaces 5.89, 6.16, and 5.72:1; danger on background 6.54:1, good on goodSurface 5.74:1, on dangerPressed 4.95:1. The yellow fill against white is below 3:1, so a primary button is identified by its dark label and its position, never by its fill alone.

## Typography

Two bundled families, clearly distinct (D-37). Bricolage Grotesque (SemiBold) sets headings, section titles, and the PM2.5 value: a grotesque with slightly irregular, friendly forms that gives Avela its voice without decoration. Onest (Regular, Medium, SemiBold) sets body, labels, captions, forms, and buttons: a neutral, highly legible sans with clear numerals. Both ship inside the app through `@expo-google-fonts`, so they load without the network; Android needs one family name per weight, so the theme names the exact face for each role. No decorative type appears in guidance, forms, or clinical results.

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

Use a single phone content column with `spacing.gutter` (20) horizontal padding and 24-unit section separation. Reserve the larger section token for major changes in task, not every row. Align titles, values, and actions to a consistent left edge. Put rows of the same kind in one `RowList` card with hairlines between them, never a card per row, and never nest a card inside a card. Scrolling content leaves 120 units at the bottom so the floating tab bar never covers it.

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

Compact width uses four labeled destinations for residents: Beranda, Laporan, Fasilitas, Akun. A staff account gets two: Antrean and Akun. The tab bar floats as a glass pill (see Shapes). Each tab stacks a Lucide icon over its label; the active tab is ink with a heavier stroke (2.25) on a soft-yellow `accentSoft` pill that wraps icon and label, and inactive tabs use `textMuted`. The full `accent` never colors a tab. The Laporan tab shows a count badge for update markers. Beranda and Akun draw their own top bar with the labelled Darurat pill (`EmergencyButton`), the same control as in the native headers; the other screens use the native header with the Darurat button on the right. The role from the session decides which set is shown; the two sets never mix. Detail screens use a contextual top app bar and native Back behavior; Android system Back must work. Avoid a permanent floating button that duplicates the screen's primary action.

At medium width (proposed 600-839 logical units), consider a navigation rail and preserve comfortable reading measure. At expanded width (840+), a staff queue may use master/detail panes if that surface is approved. Do not stretch paragraphs across the whole display. Width thresholds are implementation proposals to test, not evidence of tablet support.

### Environmental Timeline

Show a small, horizontally readable forecast trend with time labels, PM2.5 units, and an accessible list/table alternative. Break the line at missing samples. A legend under the bars names each bar color, the unit, and the highest value in the window with its time. No smooth curve or confidence band unless supported by data. A selected time displays its exact value and valid time. Forecasts remain separate from station observations; changing the source must be visible.

## Elevation & Depth

Use tonal surfaces and clear grouping first. A `Card` or a `RowList` group floats with a soft shadow plus a hairline (`shadow` in `ui.js`) so it reads on white and on the yellow wash alike; rows inside a group have no shadow of their own. The tab bar is the only translucent surface. A modal sheet may use native elevation to communicate a temporary layer; its backdrop must not obscure the current task's meaning. Avoid stacked or nested floating panels.

Motion is functional and comes from the platform: the native stack's screen transitions and the pressed state of each control. The app adds no animation library. Any state transition stays at approximately 150-220 ms and preserves content position. Honor Android Remove animations and reduced-motion preferences with instant changes or a simple fade. No smoke particles, animated risk counters, page-load choreography, or endless pulsing urgency.

Loading uses stable skeleton regions for initially absent content. A refresh preserves the last source-attributed content and shows a small updating indicator. Use a spinner only for a localized action in progress, not as a blank full-screen experience.

## Shapes

Small radius belongs to notices and compact grouping. Control radius is shared by inputs and buttons. Panel radius is reserved for the main condition summary or genuinely distinct content; sheet radius applies to temporary surfaces. Avela's visual signature is the spacious condition summary paired with a concise, plainly attributed next step, not a repeated rounded-card grid.

Use Lucide outline icons (`lucide-react-native`) at a 1.75 stroke, always next to a text label. Entry points that a resident returns to (Profil rows, the Beranda tiles) use a small set of 3D clay icons generated in Figma in the same yellow, ink, and mist palette (`assets/icons3d`); they sit on a soft-yellow tile and never stand for a status or a value. Grouped rows sit together on one white card with a soft shadow, and the tab bar floats as a glass pill above the home indicator: native liquid glass (`expo-glass-effect`) on iOS 26 and later, a light blur (`expo-blur`) on earlier iOS and the web, frosted white on Android, and solid white when the user turns on Reduce Transparency. The active tab's soft-yellow pill wraps both the icon and its label. Spot illustrations come from Figma (welcome, login, empty reports) in the mist, ink, and sun palette; they appear only on empty or first-run screens, never beside data. Familiar symbols support labels rather than replacing them. No emoji as clinical status icons, no fake hospital logos, and no photography suggesting a partner or staff member who does not exist.

## Components

These are the component contracts; `apps/mobile/src/components/ui.js` implements the shared ones. Build screens from them instead of styling by hand.

### Building Blocks

| Component | Use |
| --- | --- |
| `Screen`, `PageHeader`, `Section` | The scrolling page, its large title with an optional sentence and control, and a titled group of content |
| `Button` | `primary` (yellow, one per screen), `tonal` (secondary), text (low emphasis), `danger` (destructive or emergency); optional Lucide icon |
| `Card` | One distinct object on a floating white surface: the condition summary, a staff response, a result |
| `Row`, `RowList` | Rows of one kind on one card with hairlines: a leading Lucide icon or a 3D clay image, title, subtitle, meta, and a trailing element |
| `ActionTile` | A large entry point used in pairs on Beranda: a 3D clay icon on a soft-yellow tile, a title, and one line |
| `Chip` | One choice among a few (area, facility, course of symptoms, disposition); the chosen chip inverts to `selected` |
| `Checkbox` | A statement the user confirms, such as the report consent |
| `TextField` | Persistent label, hint, inline error; the border turns `focus` while typing |
| `Panel` | A notice in the neutral, info, warning, or danger tone, with an icon |
| `StatusPill`, `Tag` | A report state in words; a short label in a soft-yellow, information, or mist pill |
| `StatRow` | Three counts side by side on Akun; a missing count is said in words |
| `EmptyView`, `LoadingView`, `ErrorView` | An empty screen with an optional spot illustration and the next step; loading; an error with retry |
| `SimulationLabel` | The "Simulasi tugas kuliah" line |
| `SkyBackdrop`, `SunMark` | Decoration only: the soft-yellow sky behind the top of a page and the sun-and-haze motif; hidden from screen readers and never driven by data |
| `GlassBar`, `EmergencyButton` | The floating tab bar's material, and the Darurat pill in native headers |

### Environmental Summary

Include area, data kind, pollutant, unit, valid time, source, and freshness near the primary value. Put resolution details behind an accessible explanation, with a short visible regional qualifier. Do not use generationtime_ms as an issue timestamp. A missing issue time stays unknown. A station reading needs its station identity; the nearest station is not necessarily representative of the user.

### Category Chip and Community Signal

`categoryChip` sits beside the PM2.5 value and carries the category name in text with a dot. Its fill follows the ISPU category (D-38): `goodSurface`/`good` for Baik, `information` for Sedang, `warning` for Tidak Sehat, `danger` for Sangat Tidak Sehat, and ink with white text for Berbahaya. The color only speeds up reading; the words "mengacu ISPU" stay, and the chip describes the area forecast, not a personal risk level. It is not rendered while the category is null.

The community signal is one caption-size row under the forecast: the 7-day report count for the area and the words "data simulasi" in the coursework build. A hidden count reads "Belum cukup data". It is never a chart, a map, or a trend arrow.

### Exposure Context

`exposurePanel` appears in report detail for both the resident and the reviewer. It shows mean and peak PM2.5 with units, the window start and end in local time, the source, and the fixed label "Prakiraan wilayah, bukan dosis pribadi". When the context is missing, the panel says "Konteks paparan tidak tersedia" and gives no numbers. It never uses warning or danger colors: it is context for the reviewer, not a verdict.

### Staff Queue and Review

`queueRow` shows the complaint's first line, a `StatusPill`, and how long the report has waited. The rows sit in one `RowList` card with hairlines between them, not in a card each. The review screen shows exactly one primary action for the current state: claim, then ask or respond, then close. A version conflict shows an inline message and reloads the report. Every staff screen carries the "Simulasi tugas kuliah" label.

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

Use the yellow filled button for the current primary action, a `tonal` button for a secondary action, and an ink text action for low-emphasis navigation. A screen has at most one yellow button; never put two side by side. A destructive confirmation (such as "Ya, batalkan") uses the danger container, not yellow. Input outline uses the outline role; focus uses the focus role. These border/state rules live in prose rather than invalid custom component token properties.

### Report Timeline and Staff Response

Distinguish submitted, in review, awaiting information, responded, and closed. Each event shows author type and time. The published response is visually stronger than audit details. Do not use a green completed check to mean the resident is healthy. Resident comments and professional responses must not share an ambiguous author treatment. Simulation labels remain visible.

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
- Avoid generic metric tiles, gradients, glass outside the tab bar, decorative maps, 3D lungs, or an invented Avela health score. The 3D clay icons mark entry points only, never a status or a value.
- Never use weather icons or sky color as a pollution measurement.
- Do not claim the palette or this document has passed a rendered accessibility audit.

Before UI completion, capture an actual Android build at compact width, large text (including a 200% stress check where supported), outdoor brightness, iOS Reduce Transparency (the tab bar turns solid white), keyboard-open form, missing environmental data, long staff response, and a failed upload. Run the squint test on every screen: only the yellow button should stand out. Include TalkBack checks. Add tablet evidence only if tablet support is claimed. Browser mockups do not prove native behavior.
