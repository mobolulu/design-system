import React from 'react';
import { cn } from '../lib/utils';

/** Any icon component that takes a class name and a style — lucide-react's, or the app's own. */
export type PickerIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean }>;

export interface IconPickerOption {
  /** The key the record stores (e.g. `leaf`). */
  key: string;
  /** Read out and shown as a tooltip. Defaults to the key. */
  label?: string;
  icon: PickerIcon;
}

export interface IconPickerFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  /** The allowed icon set, in display order — the spec's list, not this component's. */
  options: IconPickerOption[];
  /** The chosen key, or '' for none yet. */
  value: string;
  onChange: (key: string) => void;
  /** Every icon is previewed in this colour (e.g. the record's `#RRGGBB`). */
  color?: string;
  disabled?: boolean;
  className?: string;
}

const ARROW_STEPS: Record<string, number | undefined> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * An icon picker (orchestrator#542, for Waste Types #531): a grid over a
 * passed list of icon keys, each previewed in the chosen colour. Arrow keys
 * move through the grid as a single radio group.
 */
export const IconPickerField: React.FC<IconPickerFieldProps> = ({
  label,
  hint,
  error,
  id,
  options,
  value,
  onChange,
  color,
  disabled = false,
  className,
}) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.key === value);
  // Roving tab stop: the chosen icon, else the first.
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  const focusAndPick = (index: number) => {
    const i = (index + options.length) % options.length;
    refs.current[i]?.focus();
    onChange(options[i].key);
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = ARROW_STEPS[e.key];
    if (step != null) {
      e.preventDefault();
      focusAndPick(index + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusAndPick(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusAndPick(options.length - 1);
    }
  };

  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <span id={`${fieldId}-label`} className="text-sm font-medium text-foreground">
          {label}
        </span>
      ) : null}
      <div
        id={fieldId}
        role="radiogroup"
        aria-labelledby={label ? `${fieldId}-label` : undefined}
        aria-label={label ? undefined : 'Icon'}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2"
      >
        {options.map((option, index) => {
          const Icon = option.icon;
          const selected = option.key === value;
          const name = option.label ?? option.key;
          return (
            <button
              key={option.key}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              title={name}
              tabIndex={index === tabStop ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(option.key)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                'inline-flex aspect-square items-center justify-center rounded-lg border bg-background transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
                'disabled:pointer-events-none disabled:opacity-50',
                selected ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-input',
                !color && 'text-foreground',
              )}
            >
              <Icon aria-hidden className="h-5 w-5" style={color ? { color } : undefined} />
            </button>
          );
        })}
      </div>
      {error ? (
        <span id={`${fieldId}-error`} className="text-xs text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
};
IconPickerField.displayName = 'IconPickerField';
