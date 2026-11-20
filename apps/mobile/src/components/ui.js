// Shared building blocks. Every color comes from the theme; touch targets are at least 48 units (NFR-07).
import { useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View }
  from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AlertTriangle, Check, ChevronRight, FlaskConical } from 'lucide-react-native';

import { MIN_TOUCH, gutter, rounded, spacing, typography, useTheme } from '../theme';

// One outline icon family (Lucide) at one stroke weight, always next to a text label.
export function Icon({ as: Glyph, size = 20, color = 'text', strokeWidth = 1.75, style }) {
  const { colors } = useTheme();
  if (!Glyph) return null;
  return <Glyph size={size} color={colors[color] || color} strokeWidth={strokeWidth} style={style} />;
}

export function AppText({ variant = 'body', color, style, children, ...rest }) {
  const { colors } = useTheme();
  return (
    <Text style={[typography[variant], { color: colors[color || 'text'] }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Screen({ children, refreshing = false, onRefresh }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      // iOS scrolls the focused field above the keyboard; Android resizes the window itself.
      automaticallyAdjustKeyboardInsets
      refreshControl={onRefresh ? (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted}
          colors={[colors.text]} />
      ) : undefined}
    >
      {children}
    </ScrollView>
  );
}

// The page's own heading: a large title, an optional plain sentence under it, and an optional control beside it.
export function PageHeader({ title, body, aside, style }) {
  return (
    <View style={[{ gap: spacing.sm, marginBottom: spacing.lg }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
        <AppText variant="headline" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </AppText>
        {aside}
      </View>
      {body ? <AppText color="textMuted">{body}</AppText> : null}
    </View>
  );
}

export function Section({ title, action, children, style }) {
  return (
    <View style={[{ marginTop: spacing.xxl, gap: spacing.md }, style]}>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
          <AppText variant="title" accessibilityRole="header" style={{ flex: 1 }}>
            {title}
          </AppText>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Button({ label, onPress, kind = 'primary', icon, loading = false, disabled = false, accessibilityHint,
  accessibilityLabel, style }) {
  const { colors } = useTheme();
  const off = disabled || loading;
  const look = {
    // Yellow belongs to the one primary action per screen (D-37); everything else stays white, mist, and ink.
    primary: { bg: colors.accent, pressed: colors.accentPressed, fg: colors.onAccent },
    tonal: { bg: colors.tonal, pressed: colors.tonalPressed, fg: colors.text },
    text: { bg: 'transparent', pressed: colors.surface, fg: colors.text },
    danger: { bg: colors.dangerSurface, pressed: '#F9D9D5', fg: colors.danger },
  }[kind];
  const fg = off ? colors.disabledText : look.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        kind === 'text' ? styles.textButton : null,
        { backgroundColor: off && kind !== 'text' ? colors.disabledSurface : pressed ? look.pressed : look.bg },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon as={icon} color={fg} size={20} /> : null}
      <AppText variant="bodyStrong" style={{ color: fg, textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TextField({ label, error, hint, multiline, style, onFocus, onBlur, inputRef, ...rest }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: spacing.sm }, style]}>
      <View style={{ gap: 2 }}>
        <AppText variant="label">{label}</AppText>
        {hint ? <AppText variant="caption" color="textMuted">{hint}</AppText> : null}
      </View>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        accessibilityHint={error || hint}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.text}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur(e);
        }}
        style={[
          typography.body,
          styles.field,
          {
            color: colors.text,
            backgroundColor: focused ? colors.background : colors.surface,
            borderColor: error ? colors.danger : focused ? colors.focus : colors.divider,
            minHeight: multiline ? 120 : 52,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? colors.selected : colors.divider,
          backgroundColor: selected ? colors.selected : pressed ? colors.surface : colors.background,
        },
      ]}
    >
      {selected ? <Icon as={Check} size={16} color="onSelected" strokeWidth={2.25} /> : null}
      <AppText variant="label" style={{ color: selected ? colors.onSelected : colors.text, flexShrink: 1 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function Panel({ tone = 'neutral', icon, children, style }) {
  const { colors } = useTheme();
  const bg = {
    neutral: colors.surfaceContainer,
    info: colors.informationSurface,
    warning: colors.warningSurface,
    danger: colors.dangerSurface,
    surface: colors.surface,
  }[tone];
  const iconColor = { info: 'information', warning: 'warning', danger: 'danger' }[tone] || 'text';
  const body = <View style={{ gap: spacing.sm, flex: icon ? 1 : undefined }}>{children}</View>;
  return (
    <View style={[styles.panel, { backgroundColor: bg, borderRadius: tone === 'neutral' ? rounded.panel : rounded.control },
      icon ? { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' } : null, style]}>
      {icon ? <Icon as={icon} color={iconColor} size={20} style={{ marginTop: 2 }} /> : null}
      {body}
    </View>
  );
}

export function Divider({ inset = 0 }) {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, marginLeft: inset, backgroundColor: colors.divider }} />;
}

// "Simulasi tugas kuliah": staff, facilities, and cases are fictional (SAFETY_PRIVACY).
export function SimulationLabel({ text = 'Simulasi tugas kuliah', style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, style]}>
      <Icon as={FlaskConical} size={14} color="textMuted" />
      <AppText variant="caption" color="textMuted" style={{ flexShrink: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

export function LoadingView({ label = 'Memuat…' }) {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel={label} style={{ gap: spacing.md, marginTop: spacing.lg }}>
      {[0, 1, 2].map((n) => (
        <View key={n} style={{ height: n === 0 ? 88 : 18, width: n === 2 ? '60%' : '100%',
          borderRadius: n === 0 ? rounded.panel : rounded.small, backgroundColor: colors.surface }} />
      ))}
    </View>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <Panel tone="warning" icon={AlertTriangle} style={{ marginTop: spacing.lg }}>
      <AppText color="warning" accessibilityLiveRegion="polite">
        {message || 'Tidak dapat terhubung. Coba lagi.'}
      </AppText>
      {onRetry ? <Button label="Coba lagi" kind="tonal" onPress={onRetry} style={{ alignSelf: 'flex-start' }} /> : null}
    </Panel>
  );
}

// An empty screen is an invitation to act: an optional spot illustration, one sentence, and the next step.
export function EmptyView({ title, body, action, illustration }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.sm, alignItems: illustration ? 'center' : 'stretch' }}>
      {illustration ? (
        <View style={{ width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center',
          backgroundColor: colors.accentWash, marginBottom: spacing.md }}>
          <Image source={illustration} accessibilityIgnoresInvertColors resizeMode="contain"
            style={{ width: 160, height: 136 }} />
        </View>
      ) : null}
      <AppText variant="bodyStrong" style={illustration ? { textAlign: 'center' } : null}>{title}</AppText>
      {body ? <AppText color="textMuted" style={illustration ? { textAlign: 'center' } : null}>{body}</AppText> : null}
      {action}
    </View>
  );
}

export function Row({ title, subtitle, meta, onPress, marker, icon, image, trailing, accessibilityLabel }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.surface : 'transparent' }]}
    >
      {image ? (
        <View style={[styles.rowIcon, { backgroundColor: colors.accentWash }]}>
          <Image source={image} style={{ width: 34, height: 34 }} accessibilityIgnoresInvertColors />
        </View>
      ) : icon ? (
        <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}>
          <Icon as={icon} size={20} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {marker ? <View accessibilityLabel="Ada pembaruan" style={[styles.marker, { backgroundColor: colors.information }]} />
            : null}
          <AppText variant="bodyStrong" numberOfLines={2} style={{ flex: 1 }}>
            {title}
          </AppText>
        </View>
        {typeof subtitle === 'string' ? <AppText color="textMuted">{subtitle}</AppText> : subtitle || null}
        {meta ? <AppText variant="caption" color="textMuted">{meta}</AppText> : null}
      </View>
      {trailing}
      {onPress ? <Icon as={ChevronRight} size={20} color="outline" /> : null}
    </Pressable>
  );
}

// A group of rows on one white card, hairlines between rows (one card per group, not per row).
export function RowList({ children }) {
  const items = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  return (
    <Card style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
      {items.map((child, i) => (
        <View key={child.key ?? i}>
          {i ? <Divider inset={56} /> : null}
          {child}
        </View>
      ))}
    </Card>
  );
}

// A floating white surface: soft shadow plus a hairline, so it reads on white and on the yellow wash alike.
export function Card({ children, style }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.background, borderRadius: 22, borderWidth: 1, borderColor: colors.divider },
      shadow, style]}>
      {children}
    </View>
  );
}

export const shadow = Platform.select({
  ios: { shadowColor: '#16252D', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 2 },
  default: { boxShadow: '0px 6px 16px rgba(22, 37, 45, 0.07)' },
});

// The soft-yellow sky that fades into white behind the top of a page. Decoration only.
export function SkyBackdrop({ height = 360 }) {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentSoft} stopOpacity="1" />
            <Stop offset="0.55" stopColor={colors.accentWash} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.background} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sky)" />
      </Svg>
    </View>
  );
}

export function RoundButton({ icon, onPress, accessibilityLabel, tone = 'neutral' }) {
  const { colors } = useTheme();
  const fg = tone === 'danger' ? 'danger' : 'text';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} hitSlop={4}
      style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
        backgroundColor: tone === 'danger' ? colors.dangerSurface : pressed ? colors.surface : colors.background },
        tone === 'danger' ? null : shadow]}>
      <Icon as={icon} size={20} color={fg} />
    </Pressable>
  );
}

// A short label in a pill. Tones: soft yellow, information blue, or plain mist.
export function Tag({ label, tone = 'sun' }) {
  const { colors } = useTheme();
  const [bg, fg] = { sun: [colors.accentSoft, 'text'], info: [colors.informationSurface, 'information'],
    plain: [colors.surface, 'textMuted'] }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: rounded.pill, paddingHorizontal: spacing.md, paddingVertical: 4 }}>
      <AppText variant="label" color={fg}>{label}</AppText>
    </View>
  );
}

// Three counts side by side, the number set large. Counts only; a missing count is said in words.
export function StatRow({ items }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      {items.map(({ value, label }) => (
        <View key={label} accessible accessibilityLabel={`${label}: ${value ?? 'tidak ada data'}`}
          style={{ alignItems: 'center', gap: 2, flex: 1 }}>
          <AppText variant="headline" style={{ fontSize: 32, lineHeight: 38 }}>{value ?? 'tidak ada'}</AppText>
          <AppText variant="caption" color="textMuted">{label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: gutter, paddingBottom: 120, paddingTop: spacing.lg },
  button: {
    minHeight: 52,
    borderRadius: rounded.control,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  textButton: { minHeight: MIN_TOUCH, paddingHorizontal: spacing.md },
  field: { borderWidth: 1.5, borderRadius: rounded.control, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  chip: {
    minHeight: MIN_TOUCH - 4,
    borderWidth: 1.5,
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  panel: { padding: spacing.lg },
  row: { minHeight: MIN_TOUCH + 20, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  rowIcon: { width: 44, height: 44, borderRadius: rounded.control, alignItems: 'center', justifyContent: 'center' },
  marker: { width: 8, height: 8, borderRadius: 4 },
});

// A statement the user confirms: a square box and a sentence, for consent rather than a choice between options.
export function Checkbox({ label, checked, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!checked }}
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, minHeight: MIN_TOUCH,
        paddingVertical: spacing.sm, opacity: pressed ? 0.7 : 1 })}
    >
      <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, marginTop: 0,
        alignItems: 'center', justifyContent: 'center',
        borderColor: checked ? colors.selected : colors.outline,
        backgroundColor: checked ? colors.selected : colors.background }}>
        {checked ? <Icon as={Check} size={16} color="onSelected" strokeWidth={2.5} /> : null}
      </View>
      <AppText style={{ flex: 1 }}>{label}</AppText>
    </Pressable>
  );
}

// Avela's motif: the sun behind bands of haze, from the logo's crossbar and the illustrations. Decoration only, hidden
// from screen readers, and never sized or colored by data.
export function SunMark({ size = 120, style }) {
  const { colors } = useTheme();
  const band = (top, inset, h) => (
    <View style={{ position: 'absolute', top: size * top, left: -size * inset, right: -size * (inset * 0.4),
      height: size * h, borderRadius: size, backgroundColor: colors.accentWash, opacity: 0.92 }} />
  );
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
      style={[{ width: size, height: size }, style]}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accent }} />
      {band(0.52, 0.35, 0.09)}
      {band(0.68, 0.15, 0.08)}
      {band(0.82, 0.45, 0.07)}
    </View>
  );
}

// Report state as a small pill, always in words; the tone only helps scanning (DESIGN, Semantic Mapping).
const STATE_TONES = {
  submitted: ['informationSurface', 'information'],
  in_review: ['accentSoft', 'text'],
  awaiting_information: ['warningSurface', 'warning'],
  responded: ['selected', 'onSelected'],
  closed: ['surface', 'textMuted'],
  cancelled: ['surface', 'textMuted'],
};
export function StatusPill({ state, label }) {
  const { colors } = useTheme();
  const [bg, fg] = STATE_TONES[state] || ['surface', 'text'];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: colors[bg], borderRadius: rounded.pill,
      paddingHorizontal: spacing.md, paddingVertical: 4 }}>
      <AppText variant="label" color={fg}>{label}</AppText>
    </View>
  );
}

// A large, friendly entry point used in pairs on Beranda: an icon on a soft-yellow tile, a title, and one line.
export function ActionTile({ icon, image, title, body, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${body}`} onPress={onPress}
      style={({ pressed }) => [{ flex: 1, minHeight: 140, padding: spacing.lg, gap: spacing.sm,
        borderRadius: 22, borderWidth: 1, borderColor: colors.divider,
        backgroundColor: pressed ? colors.surface : colors.background }, shadow]}>
      {image ? (
        <Image source={image} style={{ width: 52, height: 52 }} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}>
          <Icon as={icon} size={22} />
        </View>
      )}
      <View style={{ gap: 2, marginTop: 'auto' }}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color="textMuted">{body}</AppText>
      </View>
    </Pressable>
  );
}
