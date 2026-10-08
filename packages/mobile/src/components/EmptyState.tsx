import React from 'react';
import { View } from 'react-native';
import { cn } from '../lib/utils';
import { Text } from './Text';

export interface EmptyStateProps {
  /** Typically an icon (e.g. an SVG or emoji glyph). Optional. */
  icon?: React.ReactNode;
  title: string;
  /** One line of guidance — what to do, not just what's missing. */
  description?: string;
  /** Usually a `Button`. */
  action?: React.ReactNode;
  style?: object;
  className?: string;
  testID?: string;
}

/**
 * What an empty list renders now, instead of nothing (MBLL-134). An empty
 * state with no explanation reads as broken, not "no data yet".
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  style,
  className,
  testID,
}) => (
  <View
    testID={testID}
    accessibilityRole="text"
    className={cn('items-center justify-center gap-3 px-8 py-12', className)}
    style={style}
  >
    {icon && <View className="mb-1">{icon}</View>}
    <Text variant="heading" style={{ textAlign: 'center' }}>
      {title}
    </Text>
    {description && (
      <Text variant="body" tone="neutral" style={{ textAlign: 'center' }}>
        {description}
      </Text>
    )}
    {action && <View className="mt-2">{action}</View>}
  </View>
);
EmptyState.displayName = 'EmptyState';
