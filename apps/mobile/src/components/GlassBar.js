// The floating tab bar's background. Liquid glass on iOS 26 and later; a light blur elsewhere; plain white when the
// user asks the system to reduce transparency, so labels always keep their contrast.
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { colors } from '../theme';

export const BAR_RADIUS = 34;

function useReduceTransparency() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduce).catch(() => setReduce(false));
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

export default function GlassBar() {
  const reduce = useReduceTransparency();
  const clip = [StyleSheet.absoluteFill, { borderRadius: BAR_RADIUS, overflow: 'hidden' }];
  if (reduce) return <View style={[clip, { backgroundColor: colors.background }]} />;
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="light" tintColor="rgba(255, 255, 255, 0.35)"
        style={clip} />
    );
  }
  return (
    <View style={clip}>
      {/* shortcut: Android blur is experimental, so Android gets a frosted white instead; revisit with expo-blur 59. */}
      {Platform.OS === 'android' ? null : <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />}
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.62)' }]} />
    </View>
  );
}
