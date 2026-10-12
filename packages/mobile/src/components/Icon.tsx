import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../theme';

// One stroke-style set drawn on a shared 24x24 grid: ~2px visual margin on
// every side, round caps and joins, no fills except the deliberate accent
// dots. Everything is expressed in viewBox units so a single `size` scales
// the glyph and its stroke together — the icon reads the same at 20 as at 32.
//
// This exists because the three Expo apps had no icon source at all
// (MBLL-213): `tabBarIcon` was never supplied, so bottom-tabs fell back to
// its own placeholder and every tab rendered as an empty box. Only the
// glyphs those tab bars actually need live here — a 300-icon dependency for
// seven shapes is not a trade worth making.

export type IconName = 'home' | 'receipt' | 'calendar' | 'wallet' | 'user' | 'banknote' | 'gate';

type GlyphPart =
  | { readonly kind: 'path'; readonly d: string }
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number; readonly filled?: boolean };

const glyphs: Record<IconName, readonly GlyphPart[]> = {
  // House: roof, walls, door.
  home: [
    { kind: 'path', d: 'M3.25 10.75 L12 3.75 L20.75 10.75' },
    { kind: 'path', d: 'M5.75 9 V19.25 A1.5 1.5 0 0 0 7.25 20.75 H16.75 A1.5 1.5 0 0 0 18.25 19.25 V9' },
    { kind: 'path', d: 'M9.75 20.75 V15 A1.25 1.25 0 0 1 11 13.75 H13 A1.25 1.25 0 0 1 14.25 15 V20.75' },
  ],
  // Torn-off receipt: zigzag foot, three line items.
  receipt: [
    {
      kind: 'path',
      d: 'M5.75 20.75 L9 19.25 L12 20.75 L15 19.25 L18.25 20.75 V5.5 A1.75 1.75 0 0 0 16.5 3.75 H7.5 A1.75 1.75 0 0 0 5.75 5.5 Z',
    },
    { kind: 'path', d: 'M8.75 8.5 H15.25' },
    { kind: 'path', d: 'M8.75 12 H15.25' },
    { kind: 'path', d: 'M8.75 15.5 H12.75' },
  ],
  // Wall calendar: hangers, header rule, a row of dates.
  calendar: [
    {
      kind: 'path',
      d: 'M4.5 7.25 A2 2 0 0 1 6.5 5.25 H17.5 A2 2 0 0 1 19.5 7.25 V18.75 A2 2 0 0 1 17.5 20.75 H6.5 A2 2 0 0 1 4.5 18.75 Z',
    },
    { kind: 'path', d: 'M8.5 3.25 V7' },
    { kind: 'path', d: 'M15.5 3.25 V7' },
    { kind: 'path', d: 'M4.5 10.25 H19.5' },
    { kind: 'circle', cx: 8.75, cy: 14.25, r: 0.85, filled: true },
    { kind: 'circle', cx: 12, cy: 14.25, r: 0.85, filled: true },
    { kind: 'circle', cx: 15.25, cy: 14.25, r: 0.85, filled: true },
  ],
  // Billfold with a card pocket and its clasp.
  wallet: [
    {
      kind: 'path',
      d: 'M4.5 9 A2 2 0 0 1 6.5 7 H17.5 A2 2 0 0 1 19.5 9 V18 A2 2 0 0 1 17.5 20 H6.5 A2 2 0 0 1 4.5 18 Z',
    },
    { kind: 'path', d: 'M19.5 11.25 H16.25 A1.75 1.75 0 0 0 16.25 14.75 H19.5' },
    { kind: 'circle', cx: 17.5, cy: 13, r: 0.85, filled: true },
  ],
  // Head and shoulders.
  user: [
    { kind: 'circle', cx: 12, cy: 8.5, r: 3.75 },
    { kind: 'path', d: 'M4.75 20.5 A7.25 7.25 0 0 1 19.25 20.5' },
  ],
  // Banknote: frame, face, edge ticks.
  banknote: [
    {
      kind: 'path',
      d: 'M2.75 8 A1.25 1.25 0 0 1 4 6.75 H20 A1.25 1.25 0 0 1 21.25 8 V16 A1.25 1.25 0 0 1 20 17.25 H4 A1.25 1.25 0 0 1 2.75 16 Z',
    },
    { kind: 'circle', cx: 12, cy: 12, r: 2.5 },
    { kind: 'path', d: 'M6 10.5 V13.5' },
    { kind: 'path', d: 'M18 10.5 V13.5' },
  ],
  // Boom barrier: post, base, striped arm. Two stripes, not three — at
  // 24dp a third one closes the gaps and the arm reads as a solid smear.
  gate: [
    { kind: 'path', d: 'M4.5 19.5 V7.25' },
    { kind: 'path', d: 'M2.25 19.5 H6.75' },
    { kind: 'path', d: 'M4.5 8.75 H19.75 A1.5 1.5 0 0 1 21.25 10.25 V11.25 A1.5 1.5 0 0 1 19.75 12.75 H4.5' },
    { kind: 'path', d: 'M11 8.75 L8.25 12.75' },
    { kind: 'path', d: 'M17.5 8.75 L14.75 12.75' },
  ],
};

export const ICON_NAMES = Object.keys(glyphs) as IconName[];

export interface IconProps {
  name: IconName;
  /** Rendered square size in dp. Defaults to 24 — the bottom-tab icon size. */
  size?: number;
  /**
   * Stroke colour. Never hardcoded internally: React Navigation hands
   * `tabBarIcon` the resolved active/inactive tint and it has to reach the
   * glyph, otherwise the tab bar loses its selected state.
   */
  color?: string;
  /** In viewBox units, so it scales with `size`. Nudge up to weight a selected tab. */
  strokeWidth?: number;
  /**
   * Omit for decorative use (a tab already announces its own label) — the
   * icon is then hidden from the screen reader rather than read twice.
   */
  accessibilityLabel?: string;
  testID?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = theme.colors.neutral[700],
  strokeWidth = 1.75,
  accessibilityLabel,
  testID,
}) => {
  const labelled = accessibilityLabel !== undefined;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      testID={testID}
      accessible={labelled}
      accessibilityRole={labelled ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={labelled ? 'yes' : 'no-hide-descendants'}
    >
      {glyphs[name].map((part, i) =>
        part.kind === 'path' ? (
          <Path
            key={i}
            d={part.d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <Circle
            key={i}
            cx={part.cx}
            cy={part.cy}
            r={part.r}
            fill={part.filled ? color : 'none'}
            stroke={part.filled ? 'none' : color}
            strokeWidth={part.filled ? 0 : strokeWidth}
          />
        ),
      )}
    </Svg>
  );
};
