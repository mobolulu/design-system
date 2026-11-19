import React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
  trailingSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leadingIcon, trailingSlot, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-11 w-full rounded-lg border border-input bg-background py-2 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'transition-[border-color,box-shadow] hover:border-foreground/30',
              'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leadingIcon ? 'pl-10 pr-3.5' : 'px-3.5',
              trailingSlot && 'pr-11',
              error && 'border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
              className,
            )}
            {...rest}
          />
          {trailingSlot && (
            <span className="absolute right-1.5 top-1/2 flex h-7 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground">
              {trailingSlot}
            </span>
          )}
        </div>
        {error ? (
          <span className="text-xs text-destructive">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
