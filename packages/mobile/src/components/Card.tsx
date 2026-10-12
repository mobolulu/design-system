import React from 'react';
import { View } from 'react-native';
import { cn } from '../lib/utils';
import { elevation, type ElevationLevel } from '../tokens';
import { PressFeedback } from './PressFeedback';

export interface CardProps {
  /**
   * Inner padding in px. Applied as a style, always — MBLL-186 rendered the
   * three apps and found every card's contents flush against its own border,
   * because this was written `padding !== 16 ? { padding } : undefined` and
   * the className carries no padding utility. The documented default was the
   * one value the component refused to apply, so a card only had padding if
   * a caller happened to ask for a number that was not the default.
   */
  padding?: number;
  /**
   * Native elevation level (MBLL-134). Defaults to `raised`, the same
   * visual weight the old `shadow-sm` Tailwind class aimed for — except
   * `shadow-sm` is a web-only utility that React Native silently drops, so
   * every card actually rendered flat. `elevation` is a real RN style
   * object (shadow* + Android `elevation`), so this now actually lifts.
   */
  elevation?: ElevationLevel;
  /** Renders the card as a pressable surface with scale/opacity feedback. */
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
  className?: string;
  testID?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  padding = 16,
  elevation: level = 'raised',
  onPress,
  disabled,
  style,
  className,
  testID,
  children,
}) => {
  const resolvedStyle = [elevation[level], { padding }, style];
  const resolvedClassName = cn('rounded-lg border border-border bg-card', className);

  if (onPress) {
    return (
      <PressFeedback
        testID={testID}
        role="button"
        disabled={disabled}
        onPress={onPress}
        scaleTo={0.98}
        className={resolvedClassName}
        style={resolvedStyle}
      >
        {children}
      </PressFeedback>
    );
  }

  return (
    <View testID={testID} className={resolvedClassName} style={resolvedStyle}>
      {children}
    </View>
  );
};
