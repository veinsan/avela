// One haptic per user action, in the same frame as the visual change, never the only feedback (DESIGN, motion).
import * as Haptics from 'expo-haptics';

import { logFailure } from './log';

// A device without haptics, or with them off, must never break the action that triggered one.
const run = (call) => Promise.resolve().then(call).catch((e) => logFailure('playing a haptic', e));

export const haptic = {
  select: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
