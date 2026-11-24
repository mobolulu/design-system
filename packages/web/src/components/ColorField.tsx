import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

const HEX = /^#[0-9A-F]{6}$/;

/** `#RRGGBB`, six hex digits — the only colour form the catalogue stores. */
export function isHexColor(value: string): boolean {
  return HEX.test(value.trim().toUpperCase());
}

/** Upper-case, with the leading `#` added when it was left off. Not a validator — pair with `isHexColor`. */
export function normalizeHexColor(value: string): string {
  const v = value.trim().toUpperCase();
  return v.startsWith('#') ? v : `#${v}`;
}

/** Brand greens first, then distinct hues that read on a white chip. */
export const DEFAULT_COLOR_SWATCHES = [
  '#15803D',
  '#22C55E',
  '#0EA5E9',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#78716C',
  '#475569',
  '#111827',
];

export interface ColorFieldProps {
  label?: string;
  hint?: string;
  /** An error the form owns. The field's own "#RRGGBB" check is shown when the typed value is malformed. */
  error?: string;
  id?: string;
  /** `#RRGGBB`, or '' for none yet. */
  value: string;
  /** Called with a valid, upper-cased `#RRGGBB` only. */
  onChange: (hex: string) => void;
  swatches?: string[];
  disabled?: boolean;
  className?: string;
}

/**
 * A colour picker (orchestrator#542, for Waste Types #531): a swatch grid
 * and a hex box. Typing updates the value only once it is a whole
 * `#RRGGBB`; until then the box keeps the draft and says what is wrong.
 */
export const ColorField: React.FC<ColorFieldProps> = ({
  label,
  hint,
  error,
  id,
  value,
  onChange,
  swatches = DEFAULT_COLOR_SWATCHES,
  disabled = false,
  className,
}) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const [draft, setDraft] = React.useState(value);
  const [touched, setTouched] = React.useState(false);

  // A value set from outside (a swatch, a reset, a loaded record) replaces the draft.
  React.useEffect(() => {
    setDraft((d) => (normalizeHexColor(d) === value ? d : value));
  }, [value]);

  const draftValid = draft.trim() === '' || isHexColor(normalizeHexColor(draft));
  const ownError = touched && !draftValid ? 'Enter a colour as #RRGGBB, e.g. #15803D.' : undefined;
  const shownError = ownError ?? error;
  const current = isHexColor(value) ? value.toUpperCase() : '';

  const choose = (hex: string) => {
    const v = normalizeHexColor(hex);
    setDraft(v);
    setTouched(false);
    onChange(v);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div role="radiogroup" aria-label={label ? `${label} swatches` : 'Colour swatches'} className="flex flex-wrap gap-2">
        {swatches.map((raw) => {
          const hex = normalizeHexColor(raw);
          const selected = hex === current;
          return (
            <button
              key={hex}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={hex}
              disabled={disabled}
              onClick={() => choose(hex)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-white transition-transform',
                'hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30',
                'disabled:pointer-events-none disabled:opacity-50',
                selected && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
              )}
              style={{ backgroundColor: hex }}
            >
              {selected ? <Check aria-hidden className="h-4 w-4 drop-shadow" /> : null}
            </button>
          );
        })}
      </div>

      <div className="relative w-40">
        <span
          aria-hidden
          data-testid="color-field-preview"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-md border border-black/10"
          style={{ backgroundColor: current || 'transparent' }}
        />
        <input
          id={fieldId}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          maxLength={7}
          placeholder="#RRGGBB"
          disabled={disabled}
          value={draft}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            const v = normalizeHexColor(next);
            if (isHexColor(v)) {
              setTouched(false);
              onChange(v);
            }
          }}
          onBlur={() => setTouched(true)}
          className={cn(
            'flex h-11 w-full rounded-lg border border-input bg-background py-2 pl-11 pr-3.5 font-mono text-sm uppercase text-foreground',
            'placeholder:normal-case placeholder:text-muted-foreground',
            'transition-[border-color,box-shadow] hover:border-foreground/30',
            'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            shownError && 'border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
          )}
        />
      </div>

      {shownError ? (
        <span id={`${fieldId}-error`} className="text-xs text-destructive">
          {shownError}
        </span>
      ) : hint ? (
        <span id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
};
ColorField.displayName = 'ColorField';
