import React from 'react';
import { cn } from '../lib/utils';
import { MASCOT_BBOX_HEIGHT_FRACTION, MASCOT_LAYERS, MASCOT_VIEWBOX, mascotPaths } from './mascotPaths';
import { adminMascotPalette, adminMascotPaletteLight } from './mascotPalette';

export interface LogoProps {
  variant?: 'full' | 'icon';
  height?: number;
  className?: string;
  title?: string;
  /** `color` = default brand teal (light backgrounds); `light` = reversed
   *  mark + wordmark for dark backgrounds (sidebar, footers over photography). */
  tone?: 'color' | 'light';
}

// Canonical standalone copies of this mark live in assets/mobolulu-logo.svg
// (full) and assets/mobolulu-icon.svg (icon). They carry the same paths,
// `color`-tone fills and transform as the code below, and must be
// regenerated whenever either changes.
//
// `full` places the mark this tall inside the 200-unit wordmark viewBox,
// leaving room for "MOBOLULU" and the tagline to its right. Matches the
// layout math in packages/mobile/src/components/Logo.tsx so both packages
// scale the same traced mascot identically.
const WORDMARK_MARK_HEIGHT = 150;
const WORDMARK_MARK_CENTRE_X = 106;
const WORDMARK_MARK_CENTRE_Y = 100;
const MARK_SCALE = WORDMARK_MARK_HEIGHT / (MASCOT_VIEWBOX * MASCOT_BBOX_HEIGHT_FRACTION);
const MARK_OFFSET_X = WORDMARK_MARK_CENTRE_X - (MASCOT_VIEWBOX / 2) * MARK_SCALE;
const MARK_OFFSET_Y = WORDMARK_MARK_CENTRE_Y - (MASCOT_VIEWBOX / 2) * MARK_SCALE;

// The mascot's flat per-layer fills need no <defs> (no gradients), so the
// duplicate-id-across-two-mounted-Logos bug that used to force per-instance
// useId() gradient suffixes doesn't apply to this artwork. If a future
// redesign reintroduces a <defs> (gradient, filter, mask, clipPath), give it
// the same useId()-suffixed id scheme — two Logos mounted at once (hidden
// desktop sidebar + mobile drawer) will otherwise collide on url(#…) and the
// mark falls back to solid black.
const Mascot: React.FC<{ palette: Record<(typeof MASCOT_LAYERS)[number], string> }> = ({ palette }) => (
  <>
    {MASCOT_LAYERS.map((layer) => (
      <path key={layer} d={mascotPaths[layer]} fill={palette[layer]} fillRule="evenodd" />
    ))}
  </>
);

export const Logo: React.FC<LogoProps> = ({ variant = 'full', height = 40, className, title = 'MOBOLULU', tone = 'color' }) => {
  const palette = tone === 'light' ? adminMascotPaletteLight : adminMascotPalette;

  if (variant === 'icon') {
    return (
      <svg
        className={cn(className)}
        height={height}
        width={height}
        viewBox={`0 0 ${MASCOT_VIEWBOX} ${MASCOT_VIEWBOX}`}
        role="img"
        aria-label={title}
        xmlns="http://www.w3.org/2000/svg"
      >
        <Mascot palette={palette} />
      </svg>
    );
  }

  return (
    <svg
      className={cn(className)}
      height={height}
      viewBox="0 0 640 200"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={`translate(${MARK_OFFSET_X} ${MARK_OFFSET_Y}) scale(${MARK_SCALE})`}>
        <Mascot palette={palette} />
      </g>
      <text x="184" y="132" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" fontWeight="800" fontSize="66" letterSpacing="0">
        <tspan fill={tone === 'light' ? '#FFFFFF' : '#13292A'}>MOBOLULU</tspan>
      </text>
      <text x="186" y="160" fontFamily="Inter, 'Segoe UI', Arial, sans-serif" fontWeight="700" fontSize="19" letterSpacing="7" fill={tone === 'light' ? '#B5C6C5' : '#3E6260'}>
        GO GREEN
      </text>
    </svg>
  );
};
