import React, { useCallback } from 'react';
import { type GestureResponderEvent, type PressableProps, type View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion } from '../tokens';
import { useMotionDuration } from '../lib/useMotionDuration';
import { AnimatedPressable } from '../lib/animated';

export interface PressFeedbackProps extends Omit<PressableProps, 'style'> {
  style?: object;
  className?: string;
  /** Scale applied at full press-in, 0–1. Defaults to a subtle 0.97. */
  scaleTo?: number;
  /** Opacity applied at full press-in, 0–1. Defaults to 0.85. */
  opacityTo?: number;
  children?: React.ReactNode;
}

const standardEasing = Easing.bezier(
  motion.easing.standard[0],
  motion.easing.standard[1],
  motion.easing.standard[2],
  motion.easing.standard[3],
);

/**
 * Shared press response for Button, Card and ListRow (MBLL-134): a scale +
 * opacity tween on the `fast` duration, replacing the instant
 * `active:opacity-85` class swap. Collapses to the `instant` duration under
 * reduced-motion rather than losing the feedback entirely.
 */
export const PressFeedback = React.forwardRef<View, PressFeedbackProps>(
  (
    { style, className, scaleTo = 0.97, opacityTo = 0.85, onPressIn, onPressOut, children, ...pressableProps },
    ref,
  ) => {
    const pressed = useSharedValue(0);
    const duration = useMotionDuration(motion.duration.fast);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
      opacity: 1 - pressed.value * (1 - opacityTo),
    }));

    const handlePressIn = useCallback(
      (event: GestureResponderEvent) => {
        pressed.value = withTiming(1, { duration, easing: standardEasing });
        onPressIn?.(event);
      },
      [onPressIn, pressed, duration],
    );

    const handlePressOut = useCallback(
      (event: GestureResponderEvent) => {
        pressed.value = withTiming(0, { duration, easing: standardEasing });
        onPressOut?.(event);
      },
      [onPressOut, pressed, duration],
    );

    return (
      <AnimatedPressable
        ref={ref}
        className={className}
        style={[style, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...pressableProps}
      >
        {children}
      </AnimatedPressable>
    );
  },
);
PressFeedback.displayName = 'PressFeedback';
