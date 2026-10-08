import React from 'react';
import { View } from 'react-native';
import { cn } from '../lib/utils';
import { Text } from './Text';
import { PressFeedback } from './PressFeedback';

export interface ListRowProps {
  /** Usually an `Avatar` or a small icon. */
  leading?: React.ReactNode;
  title: string;
  /** Second line. Omit for a one-line row. */
  subtitle?: string;
  /** A trailing value (e.g. a `Money` amount) or a custom node. */
  trailing?: React.ReactNode;
  /** Shows a chevron after `trailing`, signalling the row navigates somewhere. */
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Overrides the accessibility label derived from title + subtitle. */
  accessibilityLabel?: string;
  style?: object;
  className?: string;
  testID?: string;
}

/**
 * The one-line/two-line row with leading icon, title, subtitle and a
 * trailing value or chevron — half the screens were rebuilding this by hand
 * (MBLL-134). Keeps a real ≥44dp touch target even though the visual row is
 * shorter, via minHeight rather than oversized padding.
 */
export const ListRow: React.FC<ListRowProps> = ({
  leading,
  title,
  subtitle,
  trailing,
  showChevron = false,
  onPress,
  disabled,
  accessibilityLabel,
  style,
  className,
  testID,
}) => {
  const content = (
    <>
      {leading && <View className="mr-3">{leading}</View>}
      <View className="flex-1 justify-center">
        <Text variant="body" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" tone="neutral" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing && <View className="ml-3">{trailing}</View>}
      {showChevron && (
        <Text variant="label" tone="neutral" style={{ marginLeft: 8 }}>
          ›
        </Text>
      )}
    </>
  );

  const rowClassName = cn('min-h-[44px] flex-row items-center px-4 py-2', className);
  const label = accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ');

  if (onPress) {
    return (
      <PressFeedback
        testID={testID}
        role="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPress={onPress}
        scaleTo={0.99}
        opacityTo={0.9}
        className={rowClassName}
        style={style}
      >
        {content}
      </PressFeedback>
    );
  }

  return (
    <View testID={testID} accessibilityLabel={label} className={rowClassName} style={style}>
      {content}
    </View>
  );
};
ListRow.displayName = 'ListRow';
