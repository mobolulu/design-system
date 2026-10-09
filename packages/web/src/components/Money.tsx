import React from 'react';
import { cn } from '../lib/utils';
import { Text } from './Text';
import { formatMinorUnits } from '../money';
import { type Tone } from '../tone';
import { textRoles, type TextRoleName } from '../tokens';

export interface MoneyProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Integer minor units of rupiah — never a float (see `money.ts`). */
  minor: number;
  /** Typography role for the amount. Defaults to `numeric` (tabular figures). */
  variant?: TextRoleName;
  /** Hide the "Rp" prefix for sentences that supply the currency themselves. */
  showPrefix?: boolean;
  /** Render an explicit "+" for positive amounts — delta/comparison columns. */
  signed?: boolean;
  tone?: Tone;
}

/**
 * Renders integer minor units of rupiah with tabular figures and a
 * de-emphasised `Rp` prefix at a smaller optical size — the prefix should
 * read as a unit label, not compete with the number (MBLL-134/MBLL-159).
 * Formatting itself is `money.ts`'s; this component never reimplements the
 * arithmetic.
 *
 * The sign sits outermost (`-Rp 70`, `+Rp 1.000` with `signed`), matching
 * `formatRupiah`/`formatMinorUnits` exactly — the two `Text` nodes below
 * concatenate to the same string those functions return, never `Rp -70`
 * (MBLL-181).
 */
export const Money: React.FC<MoneyProps> = ({
  minor,
  variant = 'numeric',
  showPrefix = true,
  signed = false,
  tone,
  className,
  ...rest
}) => {
  const amountRole = textRoles[variant];
  const prefixFontSize = Math.round(amountRole.fontSize * 0.72);
  const sign = minor < 0 ? '-' : signed && minor > 0 ? '+' : '';
  const digits = formatMinorUnits(Math.abs(minor));

  return (
    <span className={cn('inline-flex items-baseline', className)} {...rest}>
      {showPrefix && (
        <Text variant={variant} tone={tone} style={{ fontSize: prefixFontSize, fontWeight: 500 }}>
          {sign}Rp
        </Text>
      )}
      <Text variant={variant} tone={tone} className="tabular-nums">
        {showPrefix ? ` ${digits}` : `${sign}${digits}`}
      </Text>
    </span>
  );
};
Money.displayName = 'Money';
