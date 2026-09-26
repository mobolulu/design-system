import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '../lib/utils';

export interface OfflineBannerProps {
  /** Render the banner; the app owns connectivity state (NetInfo or equivalent). */
  visible: boolean;
  /** Override the default message. */
  message?: string;
  style?: object;
  className?: string;
}

// The offline state shared by the collector and disposal apps: work captured
// on the device is safe and will be sent on reconnect (XCUT-NFR-009). The
// banner reassures rather than alarms, so it uses the warning tone, never
// the error tone.
export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible,
  message = 'You are offline. Everything you do is saved on this phone and sent when you are back online.',
  style,
  className,
}) => {
  if (!visible) return null;
  return (
    <View
      accessibilityRole="alert"
      className={cn(
        'flex-row items-center rounded-md bg-warning/15 px-4 py-3',
        className,
      )}
      style={style}
    >
      <Text className="text-sm font-medium text-warning">{message}</Text>
    </View>
  );
};
OfflineBanner.displayName = 'OfflineBanner';
