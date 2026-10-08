import React from 'react';
import { cn } from '../lib/utils';
import { toneForStatus, type Tone } from '../tone';
import { type TextRoleName } from '../tokens';

export type TextElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'code';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Typography role — replaces inline font-size/font-weight classes across
   * the apps (MBLL-134/MBLL-159).
   */
  variant?: TextRoleName;
  /** Optional status tone, applied as the text color. */
  tone?: Tone;
  status?: string;
  /**
   * Element to render. `Text` is a styling primitive, not a semantic one —
   * pass a heading tag (`h1`...`h4`) when the content actually is a heading.
   * Defaults to `span` so it composes inline (e.g. inside `Money`).
   */
  as?: TextElement;
}

// One Tailwind class string per role — static literals so the host app's
// Tailwind JIT (which scans this package's compiled dist, not the role map)
// picks every one of them up regardless of which role is used at runtime.
const roleClassName: Record<TextRoleName, string> = {
  display: 'text-[34px] font-extrabold leading-[40px] tracking-[-0.5px]',
  title: 'text-[28px] font-extrabold leading-[34px] tracking-[-0.3px]',
  heading: 'text-xl font-bold leading-[26px] tracking-[-0.2px]',
  body: 'text-base font-normal leading-6',
  label: 'text-sm font-semibold leading-[18px] tracking-[0.1px]',
  caption: 'text-xs font-medium leading-4 tracking-[0.2px]',
  mono: 'font-mono text-sm font-medium leading-5',
  numeric: 'text-base font-semibold leading-6 tabular-nums',
};

const toneClassName: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  info: 'text-info',
  neutral: 'text-muted-foreground',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body', tone, status, as, className, children, ...rest }, ref) => {
    const resolvedTone: Tone | undefined = tone ?? (status ? toneForStatus(status) : undefined);
    const Component = (as ?? 'span') as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(roleClassName[variant], resolvedTone && toneClassName[resolvedTone], className)}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
Text.displayName = 'Text';
