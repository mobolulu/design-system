import * as ExpoHaptics from 'expo-haptics';

// Thin wrapper over expo-haptics (MBLL-134): one line at the call site,
// disproportionate effect on perceived quality. Screens call these at the
// specific confirmation moments that deserve them — order placed, payment
// authorised, scan accepted — not on every tap. Never throws: a haptics
// engine failure (simulator, permissions, unsupported device) must never
// break the confirmation flow it decorates.
function safe(action: () => Promise<void>): void {
  action().catch(() => {
    // Haptics are a nice-to-have; a missing/failed engine is not an error.
  });
}

export const haptics = {
  /** A primary action succeeded: order placed, payment authorised, scan accepted. */
  success(): void {
    safe(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success));
  },
  /** Something needs attention but did not fail outright. */
  warning(): void {
    safe(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning));
  },
  /** A primary action failed: payment declined, scan rejected. */
  error(): void {
    safe(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error));
  },
  /** A lightweight tap acknowledgement — not for primary confirmations. */
  tap(): void {
    safe(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light));
  },
};
