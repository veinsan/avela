// Shared building blocks. Every color comes from the theme; touch targets are at least 48 units (NFR-07).
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MIN_TOUCH, rounded, spacing, typography, useTheme } from '../theme';

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
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function Section({ title, children, style }) {
  return (
    <View style={[{ marginTop: spacing.xl, gap: spacing.sm }, style]}>
      {title ? (
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

export function Button({ label, onPress, kind = 'primary', loading = false, disabled = false, accessibilityHint, style }) {
  const { colors } = useTheme();
  const off = disabled || loading;
  const look = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary },
    tonal: { bg: colors.primaryContainer, pressed: colors.primaryContainer, fg: colors.onPrimaryContainer },
    text: { bg: 'transparent', pressed: colors.surfaceContainer, fg: colors.primary },
    danger: { bg: colors.dangerSurface, pressed: colors.dangerSurface, fg: colors.danger },
  }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      accessibilityHint={accessibilityHint}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: off && kind !== 'text' ? colors.disabledSurface : pressed ? look.pressed : look.bg },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={look.fg} style={{ marginRight: spacing.sm }} /> : null}
      <AppText variant="bodyStrong" style={{ color: off ? colors.disabledText : look.fg, textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TextField({ label, error, hint, multiline, style, ...rest }) {
  const { colors } = useTheme();
  return (
    <View style={[{ gap: spacing.xs }, style]}>
      <AppText variant="label">{label}</AppText>
      {hint ? <AppText variant="caption" color="textMuted">{hint}</AppText> : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error || hint}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[
          typography.body,
          styles.field,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.outline,
            minHeight: multiline ? 112 : MIN_TOUCH,
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
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.outline,
          backgroundColor: selected ? colors.primaryContainer : colors.surface,
        },
      ]}
    >
      <AppText variant="label" style={{ color: selected ? colors.onPrimaryContainer : colors.text }}>
        {selected ? `✓ ${label}` : label}
      </AppText>
    </Pressable>
  );
}

export function Panel({ tone = 'neutral', children, style }) {
  const { colors } = useTheme();
  const bg = {
    neutral: colors.surfaceContainer,
    info: colors.informationSurface,
    warning: colors.warningSurface,
    danger: colors.dangerSurface,
    surface: colors.surface,
  }[tone];
  return (
    <View style={[{ backgroundColor: bg, borderRadius: tone === 'neutral' ? rounded.panel : rounded.small }, styles.panel, style]}>
      {children}
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider }} />;
}

// "Simulasi tugas kuliah": staff, facilities, and cases are fictional (SAFETY_PRIVACY).
export function SimulationLabel({ text = 'Simulasi tugas kuliah' }) {
  return (
    <AppText variant="caption" color="textMuted" accessibilityLabel={`Catatan: ${text}`}>
      ⓘ {text}
    </AppText>
  );
}

export function LoadingView({ label = 'Memuat…' }) {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel={label} style={{ gap: spacing.md, marginTop: spacing.lg }}>
      {[0, 1, 2].map((n) => (
        <View key={n} style={{ height: n === 0 ? 72 : 20, borderRadius: rounded.small, backgroundColor: colors.surfaceContainer }} />
      ))}
    </View>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <Panel tone="warning" style={{ marginTop: spacing.lg }}>
      <AppText color="warning" accessibilityLiveRegion="polite">
        {message || 'Tidak dapat terhubung. Coba lagi.'}
      </AppText>
      {onRetry ? <Button label="Coba lagi" kind="tonal" onPress={onRetry} /> : null}
    </Panel>
  );
}

export function EmptyView({ title, body, action }) {
  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
      <AppText variant="bodyStrong">{title}</AppText>
      {body ? <AppText color="textMuted">{body}</AppText> : null}
      {action}
    </View>
  );
}

export function Row({ title, subtitle, meta, onPress, marker, accessibilityLabel }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.surfaceContainer : 'transparent' }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" numberOfLines={2}>
          {marker ? <AppText variant="bodyStrong" color="information">● </AppText> : null}
          {title}
        </AppText>
        {subtitle ? <AppText color="textMuted">{subtitle}</AppText> : null}
        {meta ? <AppText variant="caption" color="textMuted">{meta}</AppText> : null}
      </View>
      {onPress ? <AppText variant="title" color="textMuted">›</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing.lg, paddingBottom: spacing.section, paddingTop: spacing.lg },
  button: {
    minHeight: MIN_TOUCH,
    borderRadius: rounded.control,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  field: { borderWidth: 1, borderRadius: rounded.control, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  chip: {
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderRadius: rounded.small,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  panel: { padding: spacing.lg, gap: spacing.sm },
  row: { minHeight: MIN_TOUCH + 16, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
});
