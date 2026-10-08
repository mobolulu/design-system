import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '../lib/utils';
import { motion, radii } from '../tokens';
import { useMotionDuration } from '../lib/useMotionDuration';
import { AnimatedView } from '../lib/animated';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: keyof typeof radii;
  style?: ViewStyle;
  className?: string;
  testID?: string;
}

const shimmerEasing = Easing.bezier(
  motion.easing.standard[0],
  motion.easing.standard[1],
  motion.easing.standard[2],
  motion.easing.standard[3],
);

/**
 * A shimmering placeholder block (MBLL-134): loading used to be a centred
 * spinner on a blank screen, then a hard snap to content. This stands in for
 * the real content's shape so the layout doesn't jump when data arrives.
 * The shimmer is a reanimated opacity loop on the `motion` tokens, not a
 * static grey box — under reduced-motion it still breathes, just on the
 * `instant` duration (effectively a very fast, still-visible pulse rather
 * than a fully static block, so loading state remains perceivable).
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = 'sm',
  style,
  className,
  testID,
}) => {
  const shimmerDuration = useMotionDuration(motion.duration.slow);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: shimmerDuration || 1, easing: shimmerEasing }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity, shimmerDuration]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <AnimatedView
      testID={testID}
      className={cn('bg-muted', className)}
      style={[{ width, height, borderRadius: radii[radius] }, animatedStyle, style]}
    />
  );
};
Skeleton.displayName = 'Skeleton';

export interface SkeletonCardProps {
  style?: ViewStyle;
  className?: string;
  testID?: string;
}

/** Matches the shape of a `Card` with a title line, a subtitle line and a trailing value. */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style, className, testID }) => (
  <View
    testID={testID}
    accessibilityRole="progressbar"
    accessibilityLabel="Loading"
    className={cn('gap-3 rounded-lg border border-border bg-card p-4', className)}
    style={style}
  >
    <View className="flex-row items-center justify-between">
      <Skeleton width="55%" height={18} />
      <Skeleton width={60} height={18} radius="full" />
    </View>
    <Skeleton width="80%" height={14} />
    <Skeleton width="40%" height={14} />
  </View>
);
SkeletonCard.displayName = 'SkeletonCard';

export interface SkeletonListProps {
  /** Number of placeholder rows. Defaults to 4. */
  count?: number;
  gap?: number;
  style?: ViewStyle;
  className?: string;
  testID?: string;
}

/** Matches the shape of a `ListRow`: leading circle, two text lines, trailing value. */
export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 4, gap = 12, style, className, testID }) => (
  <View
    testID={testID}
    accessibilityRole="progressbar"
    accessibilityLabel="Loading"
    className={className}
    style={[{ gap }, style]}
  >
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} className="flex-row items-center gap-3">
        <Skeleton width={40} height={40} radius="full" />
        <View className="flex-1 gap-2">
          <Skeleton width="70%" height={14} />
          <Skeleton width="45%" height={12} />
        </View>
        <Skeleton width={48} height={14} />
      </View>
    ))}
  </View>
);
SkeletonList.displayName = 'SkeletonList';
