---
version: "0.1-proposed"
name: Avela
description: Proposed calm and legible mobile design for environmental awareness and reviewed care follow-up.
colors:
  primary: "#126B63"
  primaryPressed: "#0B514B"
  onPrimary: "#FFFFFF"
  background: "#F5F8F7"
  surface: "#FFFFFF"
  text: "#172B2A"
  textMuted: "#526462"
  border: "#CDD9D6"
  focus: "#2457C5"
  information: "#2457C5"
  warning: "#845100"
  warningSurface: "#FFF3D6"
  danger: "#B42332"
  dangerSurface: "#FFF0F1"
  disabledSurface: "#E4EBE8"
typography:
  title:
    fontFamily: system
    fontSize: 28
    fontWeight: 700
    lineHeight: 36
  heading:
    fontFamily: system
    fontSize: 22
    fontWeight: 600
    lineHeight: 30
  body:
    fontFamily: system
    fontSize: 16
    fontWeight: 400
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
  medium: 12
  large: 20
spacing:
  xs: 4
  sm: 8
  md: 12
  lg: 16
  xl: 24
  xxl: 32
components:
  buttonPrimary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.medium}"
    padding: "{spacing.lg}"
    minHeight: 48
  buttonPrimaryPressed:
    backgroundColor: "{colors.primaryPressed}"
    textColor: "{colors.onPrimary}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.large}"
    padding: "{spacing.lg}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    borderColor: "{colors.border}"
    rounded: "{rounded.medium}"
    minHeight: 48
  warningPanel:
    backgroundColor: "{colors.warningSurface}"
    textColor: "{colors.warning}"
    padding: "{spacing.lg}"
  urgentPanel:
    backgroundColor: "{colors.dangerSurface}"
    textColor: "{colors.danger}"
    padding: "{spacing.lg}"
---

## Overview

This is a proposed design direction, not a user-approved visual identity or implemented theme. Avela should feel calm, readable, and dependable. Environmental conditions and report states must be understandable under stress, on a small screen, and over limited connectivity. Avoid decorative smoke effects that obscure information or imply a measured severity.

Use Indonesian user-facing copy unless another language is explicitly selected. Documentation remains English. Numeric typography and spacing tokens use React Native logical units; web implementations must map them consistently. Use platform system fonts initially to avoid unnecessary downloads.

## Colors

Primary teal identifies actions and navigation. Neutral backgrounds separate information without heavy decoration. Warning and danger colors are reserved for clearly explained semantic states. Do not infer an AQI category from these brand colors: any environmental category palette requires a chosen standard and reviewed mapping.

Always pair color with text and, where useful, an icon. Unknown or stale conditions must not look like confirmed low risk. Focus indication uses the focus token. Contrast must be checked on actual text/background combinations before implementation sign-off; this document does not certify accessibility compliance.

## Typography

Use title for the page purpose, heading for sections, body for explanations, label for controls, and caption for source/time metadata. Captions remain readable at 14 logical units. Support system text enlargement and wrapping; do not truncate clinical follow-up or freshness labels to preserve a card height.

## Layout

Mobile uses a single content column, safe-area-aware padding of 16, and section spacing of 24. Forms are vertically ordered with visible labels. Keep the primary action reachable without covering navigation or error messages. Proposed resident navigation is in PRODUCT_FLOWS.

If an operator web surface is approved, use a queue/detail layout on larger screens and stacked panels on narrow screens. Do not force a desktop data table into a small mobile viewport. Maps supplement a usable facility list.

## Elevation & Depth

Use borders and spacing for ordinary grouping. Reserve subtle platform elevation for floating controls, menus, and dialogs. Do not layer urgent content behind a modal, map, or loading mask. Respect reduced-motion preferences; no decorative animation is necessary for core use.

## Shapes

Use small radius for compact badges, medium for inputs/buttons, and large for cards. Avoid pill shapes for long clinical status text. Use consistent icon style after selecting a compatible library; none is installed yet.

## Components

| Component | Required information and states |
| --- | --- |
| Environmental card | Area, pollutant/unit, source, valid time, observation/forecast label, freshness, resolution note |
| Guidance card | Plain-language heading, source, version/review status; no guaranteed disease outcome |
| Symptom form | Visible labels, required/optional distinctions, validation near field, preview, submission progress |
| Report timeline | Separate receipt, review, clarification, response, and closure; author/time where relevant |
| Staff response card | Reviewer/facility, published time, disposition, instructions, simulation status |
| Facility card | Source-attributed services and last verification; availability unknown when not supplied |
| Examination result | Correct account context, encounter/date, author, version, and follow-up |
| Service banner | Availability and demo status; no unearned response-time promise |

Buttons need idle, pressed, focus, disabled, and loading states. Loading does not erase the action label. Forms preserve input on recoverable failures. Screen states include initial loading, empty, partial data, stale, unavailable, permission denied, unauthorized, and successful completion.

Proposed copy examples:

- `Laporan terkirim. Belum ditinjau petugas.`
- `Data terakhir diperbarui ...` with the actual valid time.
- `Layanan peninjauan sedang tidak tersedia.`
- `Simulasi untuk demonstrasi tugas kuliah.`

These are product-state examples, not reviewed clinical advice.

## Do's and Don'ts

- Use tokens as the shared source; extend the palette before introducing a new role.
- Explain what is known, unknown, stale, and simulated.
- Keep emergency-access information reachable without completing a form.
- Do not use a reassuring green status for an unanswered report or unavailable observation.
- Do not display numerical personal disease probability without a validated method.
- Do not present a generic AI response with a clinician avatar or signature.
- Do not imply a facility has beds, staff, or supplies solely because it appears on a map.
