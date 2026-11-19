// Mirrors the frontmatter of docs/DESIGN.md (D-09). Change a token there first, then here, in the same change.
// One dark scheme on the 60/30/10 rule (D-36): gray carries the screen, silver the text, and yellow appears only on
// the one primary button per screen. The app does not follow the system light/dark setting.

const colors = {
  // 60%: gray and its lighter steps
  background: '#2B2D31',
  surface: '#33363B',
  surfaceContainer: '#3C3F45',
  tonal: '#45484E',
  tonalPressed: '#50535A',
  divider: '#46494F',
  // 30%: silver and its dimmer steps
  text: '#D9DADC',
  textMuted: '#A9ACB1',
  outline: '#8B8E94',
  focus: '#D9DADC',
  selected: '#D9DADC',
  onSelected: '#2B2D31',
  // 10%: yellow, only the primary button fill
  accent: '#FFC93C',
  accentPressed: '#E8B42F',
  onAccent: '#2B2D31',
  // Status, outside the 60/30/10 and always paired with text
  information: '#9DC1F2',
  informationSurface: '#2E3A4B',
  warning: '#F2A65E',
  warningSurface: '#45372A',
  danger: '#FF9A9A',
  dangerSurface: '#4A2F33',
  disabledSurface: '#3A3C41',
  disabledText: '#ACAFB4',
};

export const typography = {
  display: { fontSize: 40, fontWeight: '600', lineHeight: 48 },
  headline: { fontSize: 28, fontWeight: '600', lineHeight: 36 },
  title: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
};

export const rounded = { small: 8, control: 12, panel: 20, sheet: 24 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 40 };
export const MIN_TOUCH = 48;

export { colors };

export function useTheme() {
  return { colors, dark: true };
}
