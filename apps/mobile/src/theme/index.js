// Mirrors the frontmatter of docs/DESIGN.md (D-09). Change a token there first, then here, in the same change.
import { useColorScheme } from 'react-native';

const light = {
  primary: '#166B5E',
  primaryPressed: '#0D5147',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D8EEE5',
  onPrimaryContainer: '#123F35',
  background: '#F7F8F3',
  surface: '#FFFFFF',
  surfaceContainer: '#EDF1E9',
  text: '#1C302A',
  textMuted: '#52645C',
  outline: '#73857C',
  divider: '#D7DFD7',
  focus: '#275AC7',
  information: '#2655A4',
  informationSurface: '#EDF3FF',
  warning: '#7C4C00',
  warningSurface: '#FFF0D0',
  danger: '#A92437',
  dangerSurface: '#FFF0F1',
  disabledSurface: '#E1E7DF',
  disabledText: '#5D6A62',
};

const dark = {
  primary: '#91D5BE',
  primaryPressed: '#76BEA7',
  onPrimary: '#09382E',
  primaryContainer: '#204B3F',
  onPrimaryContainer: '#C3F0DE',
  background: '#111B17',
  surface: '#17251E',
  surfaceContainer: '#203128',
  text: '#E5EDE4',
  textMuted: '#B5C5B9',
  outline: '#83988B',
  divider: '#34483B',
  focus: '#ADC6FF',
  information: '#B5CAFF',
  informationSurface: '#1E304E',
  warning: '#F3C975',
  warningSurface: '#3B2D16',
  danger: '#FFB2BB',
  dangerSurface: '#421F28',
  disabledSurface: '#2B3A31',
  disabledText: '#ABB8AF',
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

export const themes = { light, dark };

export function useTheme() {
  const scheme = useColorScheme();
  return { colors: scheme === 'dark' ? dark : light, dark: scheme === 'dark' };
}
