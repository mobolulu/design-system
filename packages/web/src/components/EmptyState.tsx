import React from 'react';
import { cn } from '../lib/utils';
import { Text } from './Text';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Typically an icon (an SVG or lucide-react icon). Optional. */
  icon?: React.ReactNode;
  title: string;
  /** One line of guidance — what to do, not just what's missing. */
  description?: string;
  /** Usually a `Button`. */
  action?: React.ReactNode;
}

/**
 * What an empty list/queue renders now, instead of nothing (MBLL-134/MBLL-159)
 * — for a list that is legitimately empty, not an error state (`Alert` covers
 * errors). An empty state with no explanation reads as broken, not "no data yet".
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  ...rest
}) => (
  <div className={cn('flex flex-col items-center justify-center gap-3 px-8 py-12 text-center', className)} {...rest}>
    {icon && <div className="mb-1 text-muted-foreground">{icon}</div>}
    <Text as="h3" variant="heading">
      {title}
    </Text>
    {description && (
      <Text as="p" variant="body" tone="neutral">
        {description}
      </Text>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
EmptyState.displayName = 'EmptyState';
