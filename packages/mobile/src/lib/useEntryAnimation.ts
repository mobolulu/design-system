import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { motion } from '../tokens';
import { useMotionDuration } from './useMotionDuration';

/**
 * A fade-and-rise that plays once, on mount (MBLL-331).
 *
 * REACT NATIVE'S `Animated`, NOT REANIMATED, and that is the whole point.
 * The sign-in screen is the first frame of a cold start, which is exactly
 * where MBLL-186 found a reproducible five-minute pre-first-frame hang
 * caused by extra Reanimated nodes in the tree (see PressFeedback's header
 * for the measurements). RN's `Animated` with `useNativeDriver` adds no
 * Reanimated node and no worklet, so entry motion comes back here without
 * re-opening that defect.
 *
 * Reduced motion collapses the duration to zero via `useMotionDuration`,
 * which lands the view at its final opacity and offset on the first frame
 * rather than leaving it invisible.
 */
export interface EntryAnimationOptions {
  /** Delay before this element starts, in ms. Stagger siblings with it. */
  delay?: number;
  /** Distance risen, in dp. Defaults to 12 — a lift, not a slide. */
  distance?: number;
  /** Duration override; defaults to `motion.duration.slow`. */
  duration?: number;
}

export interface EntryAnimationStyle {
  opacity: Animated.AnimatedInterpolation<number> | number;
  transform: { translateY: Animated.AnimatedInterpolation<number> | number }[];
}

export function useEntryAnimation({
  delay = 0,
  distance = 12,
  duration = motion.duration.slow,
}: EntryAnimationOptions = {}): EntryAnimationStyle {
  const resolvedDuration = useMotionDuration(duration);
  // 0 -> 1 over the animation; both opacity and offset read off it, so the
  // two can never drift out of step.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: resolvedDuration,
      delay: resolvedDuration === 0 ? 0 : delay,
      easing: Easing.bezier(...(motion.easing.decelerate as [number, number, number, number])),
      useNativeDriver: true,
    });
    animation.start();
    // Stopping on unmount matters on this screen specifically: a user who
    // signs in during the tween unmounts it mid-flight, and a running
    // animation holds its node alive.
    return () => animation.stop();
  }, [progress, resolvedDuration, delay]);

  return useMemo(
    () => ({
      opacity: progress,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        },
      ],
    }),
    [progress, distance],
  );
}
