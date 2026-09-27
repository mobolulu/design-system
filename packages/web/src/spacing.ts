// Local copy of the spacing scale from @mobolulu/design-tokens.
// Inlined so the published web package is self-contained (tokens is internal /
// not published). Keep in sync with packages/tokens/src/spacing.ts.
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type Spacing = keyof typeof spacing;
