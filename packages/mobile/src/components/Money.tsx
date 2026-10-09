import React from 'react';
import { View, type TextStyle } from 'react-native';
import { Text } from './Text';
import { formatMinorUnits } from '../money';
import { textRoles, type TextRoleName } from '../tokens';
import { cn } from '../lib/utils';

export interface MoneyProps {
  /** Integer minor units of rupiah — never a float (see `money.ts`). */
  minor: number;
  /** Typography role for the amount. Defaults to `numeric` (tabular figures). */
  variant?: TextRoleName;
  /** Hide the "Rp" prefix for sentences that supply the currency themselves. */
  showPrefix?: boolean;
  /** Render an explicit "+" for positive amounts — delta/comparison columns. */
  signed?: boolean;
  tone?: React.ComponentProps<typeof Text>['tone'];
  color?: string;
  style?: TextStyle;
  className?: string;
  testID?: string;
}

/**
 * Renders integer minor units of rupiah with tabular figures and a
 * de-emphasised `Rp` prefix at a smaller optical size — the prefix should
 * read as a unit label, not compete with the number (MBLL-134). Formatting
 * itself is `money.ts`'s; this component never reimplements the arithmetic.
 *
 * The sign sits outermost (`-Rp 70`, `+Rp 1.000` with `signed`), matching
 * `formatRupiah`/`formatMinorUnits` exactly — the two Text nodes below
 * concatenate (and the `accessibilityLabel`, for a screen reader) to the same
 * string those functions return, never `Rp -70` (MBLL-181).
 */
export const Money: React.FC<MoneyProps> = ({
  minor,
  variant = 'numeric',
  showPrefix = true,
  signed = false,
  tone,
  color,
  style,
  className,
  testID,
}) => {
  const amountRole = textRoles[variant];
  const prefixFontSize = Math.round(amountRole.fontSize * 0.72);
  const sign = minor < 0 ? '-' : signed && minor > 0 ? '+' : '';
  const digits = formatMinorUnits(Math.abs(minor));
  const label = showPrefix ? `${sign}Rp ${digits}` : `${sign}${digits}`;

  return (
    <View
      testID={testID}
      className={cn('flex-row items-baseline', className)}
      style={style}
      accessible
      accessibilityLabel={label}
    >
      {showPrefix && (
        <Text variant={variant} tone={tone} color={color} style={{ fontSize: prefixFontSize, fontWeight: '500' }}>
          {sign}Rp
        </Text>
      )}
      <Text variant={variant} tone={tone} color={color} style={{ fontVariant: ['tabular-nums'] }}>
        {showPrefix ? ` ${digits}` : `${sign}${digits}`}
      </Text>
    </View>
  );
};
Money.displayName = 'Money';
