// Building blocks from DESIGN, Components. Colors come from the theme only; touch targets are at least 48 units.
// Motion follows DESIGN, Elevation & Depth: press scale 0.97 in 120 ms, entrances once, reduced motion respected.
import { Children, Fragment, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  cubicBezier, Easing, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MIN_TOUCH, motion, rounded, spacing, typography, useTheme } from '../theme';
import { REPORT_STATES } from '../utils/format';
import { haptic } from '../utils/haptics';

const CSS_EASE_OUT = cubicBezier(...motion.easeOut);
const EASE_IN_OUT = Easing.bezier(...motion.easeInOut);
const EASE_OUT = Easing.bezier(...motion.easeOut);

export function AppText({ variant = 'body', color, style, children, ...rest }) {
  const { colors } = useTheme();
  return (
    <Text style={[typography[variant], { color: colors[color || 'text'] }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Icon({ name, size = 20, color = 'text', style }) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={colors[color] || color} style={style} />;
}

// Scale to 0.97 while pressed: feedback on press-in, commit on press-out.
export function PressableScale({ onPress, disabled, style, children, hitSlop, ...a11y }) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      pressRetentionOffset={16}
      hitSlop={hitSlop}
      accessibilityRole="button"
      {...a11y}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: pressed && !reduced ? 0.97 : 1 }],
            transitionProperty: 'transform',
            transitionDuration: motion.press,
            transitionTimingFunction: CSS_EASE_OUT,
          },
          typeof style === 'function' ? style({ pressed }) : style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Enters once, the first time the content the user waited for appears.
export function FadeIn({ index = 0, children, style }) {
  const reduced = useReducedMotion();
  const entering = useMemo(
    () =>
      reduced
        ? undefined
        : FadeInDown.duration(motion.enter)
            .delay(Math.min(index, 8) * motion.stagger)
            .easing(EASE_OUT)
            .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] }),
    [index, reduced],
  );
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

export function EmergencyPill() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => navigation.navigate('Darurat')}
      hitSlop={8}
      accessibilityLabel="Darurat, nomor gawat darurat"
      style={[styles.pill, { backgroundColor: colors.dangerSurface }]}
    >
      <Icon name="call" size={16} color="danger" />
      <AppText variant="label" color="danger">Darurat</AppText>
    </PressableScale>
  );
}

// A scrolling screen. Tab screens pass `title` for the large title block; stack screens use the native header.
export function Screen({ children, title, subtitle, emergency = true, refreshing = false, onRefresh, footer }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.screen, title ? { paddingTop: insets.top + spacing.lg } : null]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.text}
              colors={[colors.onSelected]}
              progressBackgroundColor={colors.selected}
            />
          ) : undefined
        }
      >
        {title ? (
          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <AppText variant="headline" accessibilityRole="header">{title}</AppText>
              {subtitle ? <AppText variant="caption" color="textMuted">{subtitle}</AppText> : null}
            </View>
            {emergency ? <EmergencyPill /> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.background }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export function Section({ title, action, children, style }) {
  return (
    <View style={[{ marginTop: spacing.xl, gap: spacing.md }, style]}>
      {title || action ? (
        <View style={styles.sectionHeader}>
          {title ? (
            <AppText variant="title" accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>
          ) : <View style={{ flex: 1 }} />}
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const buttonLooks = (c) => ({
  primary: { bg: c.accent, pressed: c.accentPressed, fg: c.onAccent },
  tonal: { bg: c.tonal, pressed: c.tonalPressed, fg: c.text },
  ghost: { bg: 'transparent', pressed: c.surface, fg: c.text },
  danger: { bg: c.dangerSurface, pressed: c.dangerSurface, fg: c.danger },
});

export function Button({ label, onPress, kind = 'primary', icon, loading = false, disabled = false, style, accessibilityHint }) {
  const { colors } = useTheme();
  const look = buttonLooks(colors)[kind];
  const off = disabled || loading;
  const fg = off ? colors.disabledText : look.fg;
  return (
    <PressableScale
      onPress={onPress}
      disabled={off}
      accessibilityState={{ disabled: off, busy: loading }}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      style={({ pressed }) => [
        kind === 'ghost' ? styles.ghost : styles.button,
        { backgroundColor: off && kind !== 'ghost' ? colors.disabledSurface : pressed ? look.pressed : look.bg },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
      <AppText variant={kind === 'ghost' ? 'label' : 'bodyStrong'} style={{ color: fg, textAlign: 'center' }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export function Card({ children, tone = 'surface', style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tone === 'container' ? colors.surfaceContainer : colors.surface }, style]}>
      {children}
    </View>
  );
}

export function Divider({ inset = 0 }) {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginLeft: inset }} />;
}

// Rows of the same kind in one surface, with inset dividers between them.
export function ListGroup({ children, inset = spacing.lg, style }) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, { backgroundColor: colors.surface }, style]}>
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 ? <Divider inset={inset} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

export function ListRow({ icon, title, subtitle, meta, right, onPress, marker, accessibilityLabel }) {
  const { colors } = useTheme();
  const body = (
    <>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainer }]}>
          <Ionicons name={icon} size={20} color={colors.text} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {marker ? <View style={[styles.marker, { backgroundColor: colors.information }]} /> : null}
          <AppText variant="bodyStrong" numberOfLines={2} style={{ flex: 1 }}>{title}</AppText>
        </View>
        {subtitle ? <AppText variant="caption" color="textMuted" numberOfLines={2}>{subtitle}</AppText> : null}
        {typeof meta === 'string' ? <AppText variant="caption" color="textMuted">{meta}</AppText> : meta}
      </View>
      {right}
      {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.surfaceContainer : 'transparent' }]}
    >
      {body}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => {
        if (!selected) haptic.select();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.selected : colors.outline,
          backgroundColor: selected ? colors.selected : colors.surface,
        },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={16} color={colors.onSelected} />
      ) : icon ? (
        <Ionicons name={icon} size={16} color={colors.text} />
      ) : null}
      <AppText variant="label" style={{ color: selected ? colors.onSelected : colors.text, flexShrink: 1 }}>{label}</AppText>
    </PressableScale>
  );
}

export function ChipRow({ children }) {
  return <View style={styles.chipRow} accessibilityRole="radiogroup">{children}</View>;
}

// Two to four filters over one list. The indicator slides to the chosen option (DESIGN, motion).
export function Segmented({ options, value, onChange }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [layouts, setLayouts] = useState({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);

  useEffect(() => {
    const l = layouts[value];
    if (!l) return;
    const config = { duration: reduced ? 0 : motion.move, easing: EASE_IN_OUT };
    const first = w.get() === 0; // the first placement jumps; later changes slide
    x.set(first ? l.x : withTiming(l.x, config));
    w.set(first ? l.width : withTiming(l.width, config));
  }, [value, layouts, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const indicator = useAnimatedStyle(() => ({
    opacity: w.get() > 0 ? 1 : 0,
    width: w.get(),
    transform: [{ translateX: x.get() }],
  }));

  return (
    <View style={[styles.segmented, { backgroundColor: colors.surface }]} accessibilityRole="tablist">
      <Animated.View style={[styles.segmentedIndicator, { backgroundColor: colors.tonal }, indicator]} />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onLayout={(e) => {
              const { x: lx, width } = e.nativeEvent.layout;
              setLayouts((prev) => ({ ...prev, [o.value]: { x: lx, width } }));
            }}
            onPress={() => {
              if (!active) {
                haptic.select();
                onChange(o.value);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.segment}
          >
            <AppText variant="label" numberOfLines={1} style={{ color: active ? colors.text : colors.textMuted }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const STATE_LOOKS = {
  submitted: { icon: 'paper-plane-outline', tone: 'info' },
  in_review: { icon: 'eye-outline', tone: 'neutral' },
  awaiting_information: { icon: 'help-circle-outline', tone: 'warning' },
  responded: { icon: 'chatbubble-ellipses-outline', tone: 'neutral' },
  closed: { icon: 'checkmark-done-outline', tone: 'neutral' },
  cancelled: { icon: 'close-circle-outline', tone: 'neutral' },
};

export function StatusPill({ state }) {
  const { colors } = useTheme();
  const look = STATE_LOOKS[state] || STATE_LOOKS.in_review;
  const [bg, fg] = {
    info: [colors.informationSurface, colors.information],
    warning: [colors.warningSurface, colors.warning],
    neutral: [colors.surfaceContainer, colors.text],
  }[look.tone];
  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Ionicons name={look.icon} size={14} color={fg} />
      <AppText variant="label" style={{ color: fg }}>{REPORT_STATES[state] || state}</AppText>
    </View>
  );
}

const BANNER_TONES = {
  info: ['informationSurface', 'information', 'information-circle-outline'],
  warning: ['warningSurface', 'warning', 'alert-circle-outline'],
  danger: ['dangerSurface', 'danger', 'warning-outline'],
  neutral: ['surfaceContainer', 'textMuted', 'information-circle-outline'],
};

export function Banner({ tone = 'info', icon, title, children, action, animate = false }) {
  const { colors } = useTheme();
  const [bg, fg, defaultIcon] = BANNER_TONES[tone];
  const content = (
    <View style={[styles.banner, { backgroundColor: colors[bg] }]} accessibilityLiveRegion="polite">
      <Ionicons name={icon || defaultIcon} size={22} color={colors[fg]} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        {title ? <AppText variant="bodyStrong">{title}</AppText> : null}
        {typeof children === 'string' ? <AppText>{children}</AppText> : children}
        {action ? <View style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>{action}</View> : null}
      </View>
    </View>
  );
  return animate ? <FadeIn>{content}</FadeIn> : content;
}

export function Skeleton({ height = 20, width = '100%', style }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  return (
    <Animated.View
      style={[
        { height, width, borderRadius: rounded.small, backgroundColor: colors.surfaceContainer },
        reduced
          ? null
          : {
              animationName: { from: { opacity: 0.55 }, to: { opacity: 1 } },
              animationDuration: 800,
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationTimingFunction: 'ease-in-out',
            },
        style,
      ]}
    />
  );
}

export function LoadingView({ label = 'Memuat', card = true }) {
  return (
    <View accessibilityLabel={label} style={{ gap: spacing.md, marginTop: spacing.lg }}>
      {card ? <Skeleton height={120} style={{ borderRadius: rounded.panel }} /> : null}
      <Skeleton height={18} width="70%" />
      <Skeleton height={18} width="45%" />
    </View>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Banner
        tone="warning"
        icon="cloud-offline-outline"
        title="Gagal memuat"
        action={onRetry ? <Button label="Coba lagi" kind="tonal" icon="refresh" onPress={onRetry} /> : null}
        animate
      >
        {message || 'Tidak dapat terhubung. Coba lagi.'}
      </Banner>
    </View>
  );
}

export function EmptyState({ icon = 'documents-outline', title, body, action }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <AppText variant="bodyStrong" style={{ textAlign: 'center' }}>{title}</AppText>
      {body ? <AppText color="textMuted" style={{ textAlign: 'center' }}>{body}</AppText> : null}
      {action ? <View style={{ alignSelf: 'stretch', marginTop: spacing.sm }}>{action}</View> : null}
    </View>
  );
}

export function FieldError({ message }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={styles.fieldNote} accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle" size={16} color={colors.danger} />
      <AppText variant="caption" color="danger" style={{ flex: 1 }}>{message}</AppText>
    </View>
  );
}

export function TextField({ label, error, hint, multiline, style, ...rest }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: spacing.sm }, style]}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error || hint}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.text}
        cursorColor={colors.text}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          typography.body,
          styles.field,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : focused ? colors.focus : 'transparent',
            minHeight: multiline ? 120 : 52,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        {...rest}
      />
      {error ? <FieldError message={error} /> : hint ? <AppText variant="caption" color="textMuted">{hint}</AppText> : null}
    </View>
  );
}

// "Simulasi tugas kuliah": staff, facilities, and cases are fictional (SAFETY_PRIVACY).
export function SimulationLabel({ text = 'Simulasi tugas kuliah' }) {
  return (
    <View style={styles.simulation}>
      <Icon name="flask-outline" size={16} color="textMuted" />
      <AppText variant="caption" color="textMuted" style={{ flex: 1 }}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg, paddingBottom: spacing.section },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
  footer: {
    paddingHorizontal: spacing.screen, paddingTop: spacing.md, paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, height: 40, paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
  },
  button: {
    minHeight: 52, borderRadius: rounded.control, paddingHorizontal: spacing.screen, paddingVertical: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  ghost: {
    minHeight: MIN_TOUCH, borderRadius: rounded.control, paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
  },
  card: { borderRadius: rounded.panel, padding: spacing.screen, gap: spacing.md },
  group: { borderRadius: rounded.panel, overflow: 'hidden' },
  row: {
    minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  marker: { width: 8, height: 8, borderRadius: 4 },
  chip: {
    minHeight: 44, maxWidth: '100%', borderWidth: 1, borderRadius: rounded.pill, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  segmented: { flexDirection: 'row', borderRadius: rounded.control, padding: 4, minHeight: MIN_TOUCH },
  segmentedIndicator: { position: 'absolute', top: 4, bottom: 4, left: 0, borderRadius: 10 },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: rounded.pill,
  },
  banner: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: rounded.control },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  field: { borderWidth: 2, borderRadius: rounded.control, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  fieldNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  simulation: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
});
