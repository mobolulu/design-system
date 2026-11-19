import React from 'react';
import type { TextInput } from 'react-native';
import { Input, type InputProps } from './Input';
import { applyMask, maskCapacity, unmask } from '../lib/mask';

export interface MaskedInputProps
  extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType' | 'secureTextEntry'> {
  /** `#` is one digit; anything else is a separator. `'#### #### #### ####'`. */
  mask: string;
  /** The digits only — never the separators. */
  value: string;
  /** Called with the digits only. */
  onChangeValue: (digits: string) => void;
  /**
   * Shows "12 / 16 digits" under the field while it is being filled, so a
   * long number can be checked without counting. Hidden when an `error` or
   * a `hint` is given. On by default.
   */
  showCount?: boolean;
}

/**
 * A number field that groups its digits as they are typed — a 16-digit KTP
 * number reads as `3578 0109 0990 0001`, not as one unbroken run nobody can
 * check against the card. The call site only ever sees the digits.
 *
 * Opens the number pad, takes a pasted number with or without separators,
 * and stops at the mask's length.
 */
export const MaskedInput = React.forwardRef<TextInput, MaskedInputProps>(
  ({ mask, value, onChangeValue, showCount = true, hint, error, placeholder, ...rest }, ref) => {
    const capacity = maskCapacity(mask);
    const digits = unmask(value, mask);
    const shown = applyMask(digits, mask);

    const handleChange = (text: string) => {
      let next = unmask(text, mask);
      // Backspace landed on a separator: the text got shorter but no digit
      // went. Take the digit before it, or the caret sits still.
      if (text.length < shown.length && next === digits) next = next.slice(0, -1);
      if (next !== digits) onChangeValue(next);
    };

    const count =
      showCount && !hint && !error && digits.length > 0
        ? digits.length === capacity
          ? `${capacity} digits ✓`
          : `${digits.length} / ${capacity} digits`
        : undefined;

    return (
      <Input
        ref={ref}
        {...rest}
        value={shown}
        onChangeText={handleChange}
        keyboardType="number-pad"
        autoCorrect={false}
        autoCapitalize="none"
        placeholder={placeholder ?? mask.replace(/#/g, '0')}
        hint={hint ?? count}
        error={error}
      />
    );
  },
);
MaskedInput.displayName = 'MaskedInput';
