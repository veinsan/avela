// Mirrors the frontmatter of docs/DESIGN.md (D-09). Change a token there first, then here, in the same change.
// One light scheme, "udara terang" (D-37, replaces the dark D-36 palette): white paper carries the screen, slate ink
// the text, and the sun yellow appears only on the one primary button per screen. The app does not follow the
// system light/dark setting.

const colors = {
  // 60%: white paper and its cool mist steps
  background: '#FFFFFF',
  surface: '#F4F7F8',
  surfaceContainer: '#E9F0F3',
  tonal: '#E9EEF1',
  tonalPressed: '#DCE3E7',
  divider: '#E3E9EC',
  // 30%: slate ink and its softer steps
  text: '#16252D',
  textMuted: '#52626B',
  outline: '#7A8A93',
  focus: '#16252D',
  selected: '#16252D',
  onSelected: '#FFFFFF',
  // 10%: sun yellow, only the primary button fill
  accent: '#FFC23D',
  accentPressed: '#F2B01E',
  onAccent: '#16252D',
  // Soft yellow: "you are here" and warmth (active tab, icon tiles, the morning wash on Beranda). Never an action fill,
  // never a status, never tied to a pollution value.
  accentSoft: '#FFF3CC',
  accentWash: '#FFF8E5',
  // Status, outside the 60/30/10 and always paired with text
  information: '#1F5F99',
  informationSurface: '#EAF2FA',
  warning: '#8A4B00',
  warningSurface: '#FFF2DF',
  danger: '#B3261E',
  dangerSurface: '#FDECEA',
  dangerPressed: '#F9D9D5',
  // ISPU category Baik only (D-38); never a personal all-clear.
  good: '#1E6B3A',
  goodSurface: '#E6F4EA',
  disabledSurface: '#EEF1F3',
  disabledText: '#5E6C74',
};

// Custom fonts need one family per weight on Android, so each role names its exact face.
export const fonts = {
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'Onest_400Regular',
  bodyMedium: 'Onest_500Medium',
  bodyStrong: 'Onest_600SemiBold',
};

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 64, lineHeight: 68, letterSpacing: -2 },
  headline: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodyStrong, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
};

export const rounded = { small: 10, control: 14, panel: 24, sheet: 28, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 40 };
export const gutter = 20;
export const MIN_TOUCH = 48;

export { colors };

export function useTheme() {
  return { colors, dark: false };
}
