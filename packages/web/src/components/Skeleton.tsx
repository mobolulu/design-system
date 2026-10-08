import React from 'react';
import { cn } from '../lib/utils';

export type SkeletonRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  width?: number | string;
  height?: number | string;
  radius?: SkeletonRadius;
}

const radiusClassName: Record<SkeletonRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * A shimmering placeholder block (MBLL-134/MBLL-159): stands in for the real
 * content's shape so the layout doesn't jump when data arrives, instead of a
 * centred spinner on a blank screen. The shimmer is the `shimmer` keyframe
 * (tailwind-preset.ts), tuned to the same duration/easing as the mobile
 * version's Reanimated loop so the two platforms read as one product. Honors
 * `prefers-reduced-motion` via `motion-reduce:animate-none`, leaving a static
 * (still legible as loading) block rather than a moving one.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = 'sm',
  className,
  style,
  ...rest
}) => (
  <div
    className={cn('animate-shimmer motion-reduce:animate-none bg-muted', radiusClassName[radius], className)}
    style={{ width, height, ...style }}
    {...rest}
  />
);
Skeleton.displayName = 'Skeleton';

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Matches the shape of a `Card` with a title line, a subtitle line and a trailing value. */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, ...rest }) => (
  <div
    role="progressbar"
    aria-label="Loading"
    className={cn('flex flex-col gap-3 rounded-lg border border-border bg-card p-4', className)}
    {...rest}
  >
    <div className="flex items-center justify-between">
      <Skeleton width="55%" height={18} />
      <Skeleton width={60} height={18} radius="full" />
    </div>
    <Skeleton width="80%" height={14} />
    <Skeleton width="40%" height={14} />
  </div>
);
SkeletonCard.displayName = 'SkeletonCard';

export interface SkeletonListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Number of placeholder rows. Defaults to 4. */
  count?: number;
  gap?: number;
}

/** Matches the shape of a row: leading circle, two text lines, trailing value. */
export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 4, gap = 12, className, style, ...rest }) => (
  <div
    role="progressbar"
    aria-label="Loading"
    className={cn('flex flex-col', className)}
    style={{ gap, ...style }}
    {...rest}
  >
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <Skeleton width={40} height={40} radius="full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton width="70%" height={14} />
          <Skeleton width="45%" height={12} />
        </div>
        <Skeleton width={48} height={14} />
      </div>
    ))}
  </div>
);
SkeletonList.displayName = 'SkeletonList';
