import React, { useCallback, useState } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type View } from 'react-native';
import { motion } from '../tokens';
import { useMotionDuration } from '../lib/useMotionDuration';

export interface PressFeedbackProps extends Omit<PressableProps, 'style'> {
  style?: object;
  className?: string;
  /** Scale applied at full press-in, 0–1. Defaults to a subtle 0.97. */
  scaleTo?: number;
  /** Opacity applied at full press-in, 0–1. Defaults to 0.85. */
  opacityTo?: number;
  children?: React.ReactNode;
}

/**
 * Shared press response for Button, Card and ListRow (MBLL-134): a scale +
 * opacity change on press, applied to a single plain `Pressable`.
 *
 * ONE NODE, AND NOT AN ANIMATED ONE. Both constraints are load-bearing and
 * were paid for in MBLL-186:
 *
 * - It must be a plain React Native `Pressable`, because that is what
 *   NativeWind styles without any registration. The previous version put
 *   `className` on a Reanimated `AnimatedPressable` behind a `cssInterop`
 *   registration; the classes never arrived, so every Button rendered with
 *   no background and a white label on a white card — invisible. See
 *   lib/animated.ts.
 * - It must not be wrapped in an animated view either. The first attempt at
 *   the fix kept the Reanimated tween on an `AnimatedView` around the
 *   Pressable. That rendered the buttons correctly — and then the app hung
 *   for five minutes before its first frame on a cold start after
 *   `pm clear`, reproducibly, in two independent device runs (mobile-client
 *   38203787125, attempts 1 and 2: `Displayed MainActivity +5m1s`, against
 *   ~640 ms for the launches either side of it). No JS error, no crash —
 *   it simply did not draw. Doubling the Reanimated node count across every
 *   Button, Card and ListRow in the tree is not worth that.
 *
 * So the tween is gone and the feedback is a state-driven style instead:
 * instant rather than eased. That is a deliberate partial regression of
 * MBLL-134's motion work. A button that is visible, on an app that starts,
 * beats a smoothly animated one that is neither — and `useMotionDuration`
 * stays wired so the easing can come back the moment it can be done
 * without a second node.
 */
export const PressFeedback = React.forwardRef<View, PressFeedbackProps>(
  (
    { style, className, scaleTo = 0.97, opacityTo = 0.85, onPressIn, onPressOut, children, ...pressableProps },
    ref,
  ) => {
    const [pressed, setPressed] = useState(false);
    // Reduced motion flattens the scale to nothing but keeps the opacity
    // dip, so the control still acknowledges a press.
    const duration = useMotionDuration(motion.duration.fast);
    const scale = duration === 0 ? 1 : scaleTo;

    const handlePressIn = useCallback(
      (event: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(event);
      },
      [onPressIn],
    );

    const handlePressOut = useCallback(
      (event: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(event);
      },
      [onPressOut],
    );

    return (
      <Pressable
        ref={ref}
        className={className}
        style={[style, pressed ? { transform: [{ scale }], opacity: opacityTo } : null]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...pressableProps}
      >
        {children}
      </Pressable>
    );
  },
);
PressFeedback.displayName = 'PressFeedback';
