import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '../lib/utils';

export interface PendingSyncBadgeProps {
  /** Number of items captured locally and not yet delivered. */
  count: number;
  /** Singular noun for the queued thing, e.g. "pickup" or "scan". */
  itemName: string;
  /** Plural noun; defaults to `${itemName}s`. */
  itemPlural?: string;
  style?: object;
  textStyle?: object;
  className?: string;
  textClassName?: string;
}

// "Captured locally, not yet delivered" (MBLL-38): the outbox state shown
// next to the thing waiting — a pickup photo, a gate scan — while it is
// still queued on the device. Renders nothing when the queue is empty, so
// screens can mount it unconditionally.
export const PendingSyncBadge: React.FC<PendingSyncBadgeProps> = ({
  count,
  itemName,
  itemPlural,
  style,
  textStyle,
  className,
  textClassName,
}) => {
  if (count <= 0) return null;
  const noun = count === 1 ? itemName : (itemPlural ?? `${itemName}s`);
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${count} ${noun} waiting to send`}
      className={cn(
        'flex-row items-center gap-1.5 self-start rounded-full bg-warning/15 px-3 py-1',
        className,
      )}
      style={style}
    >
      <View className="h-1.5 w-1.5 rounded-full bg-warning" />
      <Text className={cn('text-xs font-semibold text-warning', textClassName)} style={textStyle}>
        {count} {noun} waiting to send
      </Text>
    </View>
  );
};
PendingSyncBadge.displayName = 'PendingSyncBadge';
