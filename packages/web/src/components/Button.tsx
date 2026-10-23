import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonSharedProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Stretches the button to fill the width of its container. Correct for a
   * button that is the only (or stacked, column-direction) child. In a row
   * of buttons each one claims 100% of the row's width, pushing its
   * siblings out — use `grow` there instead.
   */
  fullWidth?: boolean;
  /**
   * Lets the button share the row equally with its siblings (`flex: 1`),
   * instead of claiming the whole row the way `fullWidth` does.
   */
  grow?: boolean;
}

export type ButtonProps =
  | (ButtonSharedProps & {
      asChild?: false;
      loading?: boolean;
      disabled?: boolean;
    })
  | (ButtonSharedProps & {
      /**
       * Renders the child element in place of the host `<button>` (via
       * Radix `Slot`), carrying over the button's classes and other props.
       * `loading` and `disabled` are not supported here: the target is
       * often not a `<button>` (e.g. `next/link`'s `<a>`), which has no
       * `disabled` attribute, and there is no single correct place to put
       * a loading spinner next to an arbitrary single child.
       */
      asChild: true;
      loading?: never;
      disabled?: never;
    });

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, grow = false, className, children, ...rest }, ref) => {
    const classes = cn(
      buttonVariants({ variant, size }),
      fullWidth && 'w-full',
      grow && 'flex-1',
      className,
    );

    if (rest.asChild) {
      const { asChild, ...slotProps } = rest;
      return (
        <Slot ref={ref} className={classes} {...slotProps}>
          {children}
        </Slot>
      );
    }

    const { asChild, loading = false, disabled, ...buttonProps } = rest;
    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...buttonProps}>
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
