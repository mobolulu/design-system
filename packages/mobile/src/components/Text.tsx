import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { textRoles, type TextRoleName } from '../tokens';
import { toneColor } from '../theme';
import { type Tone } from '../tokens';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * Typography role — replaces inline `fontSize`/`fontWeight` across the
   * apps (MBLL-134). Named `variant` (not `role`) because RN's own `role`
   * prop is the accessibility role and this component still forwards it.
   */
  variant?: TextRoleName;
  /** Optional status tone, applied as the text color. */
  tone?: Tone;
  /** Any other color override; takes precedence over `tone`. */
  color?: string;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

/**
 * The one place a screen picks a text style. Takes a typography role instead
 * of raw `fontSize`/`fontWeight`, which is how screens ended up with
 * thirteen slightly different "big bold number" styles and no tabular
 * figures on money (MBLL-134).
 */
export const Text: React.FC<TextProps> = ({ variant = 'body', tone, color, style, children, ...rest }) => {
  const roleStyle = textRoles[variant];
  const resolvedColor = color ?? (tone ? toneColor[tone] : undefined);
  return (
    <RNText
      style={[
        {
          fontSize: roleStyle.fontSize,
          fontWeight: roleStyle.fontWeight,
          lineHeight: roleStyle.lineHeight,
          letterSpacing: roleStyle.letterSpacing,
          ...(roleStyle.fontVariant ? { fontVariant: [...roleStyle.fontVariant] } : null),
          ...(resolvedColor ? { color: resolvedColor } : null),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
Text.displayName = 'Text';
