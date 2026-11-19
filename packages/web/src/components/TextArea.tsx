import React from 'react';
import { cn } from '../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'flex min-h-[96px] w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm leading-relaxed text-foreground',
            'placeholder:text-muted-foreground',
            'transition-[border-color,box-shadow] hover:border-foreground/30',
            'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            className,
          )}
          {...rest}
        />
        {error ? (
          <span className="text-xs text-destructive">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    );
  },
);
TextArea.displayName = 'TextArea';
