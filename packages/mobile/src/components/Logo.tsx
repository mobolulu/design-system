import React from 'react';
import Svg, { Path, G, Text as SvgText, TSpan } from 'react-native-svg';
import { MASCOT_BBOX_HEIGHT_FRACTION, MASCOT_LAYERS, MASCOT_VIEWBOX, mascotPaths } from './mascotPaths';
import { mascotPalettes, type MascotApp } from './mascotPalette';

export interface LogoProps {
  variant?: 'full' | 'icon';
  size?: number;
  title?: string;
  /**
   * Which app this is rendering in. Picks the launcher-icon livery so the
   * in-app mark and the home-screen icon are the same brand (MBLL-330).
   * Defaults to the client green, which is also the package's brand colour.
   */
  app?: MascotApp;
}

// `full` places the mark this tall inside the 200-unit wordmark viewBox,
// leaving room for "MOBOLULU" and the tagline to its right.
const WORDMARK_MARK_HEIGHT = 150;
const WORDMARK_MARK_CENTRE_X = 106;
const WORDMARK_MARK_CENTRE_Y = 100;

const MARK_SCALE = WORDMARK_MARK_HEIGHT / (MASCOT_VIEWBOX * MASCOT_BBOX_HEIGHT_FRACTION);
const MARK_OFFSET_X = WORDMARK_MARK_CENTRE_X - (MASCOT_VIEWBOX / 2) * MARK_SCALE;
const MARK_OFFSET_Y = WORDMARK_MARK_CENTRE_Y - (MASCOT_VIEWBOX / 2) * MARK_SCALE;

/**
 * The MOBOLULU mascot — the wheelie bin the owner supplied, traced from
 * `assets/mobolulu-mascot-1024.png` by `scripts/trace-mascot.mjs`. Flat
 * layers painted darkest first; see `mascotPaths.ts` for why they nest.
 */
const Mascot: React.FC<{ app: MascotApp }> = ({ app }) => {
  const palette = mascotPalettes[app];
  return (
    <>
      {MASCOT_LAYERS.map((layer) => (
        <Path key={layer} d={mascotPaths[layer]} fill={palette[layer]} fillRule="evenodd" />
      ))}
    </>
  );
};

export const Logo: React.FC<LogoProps> = ({ variant = 'full', size = 40, title = 'MOBOLULU', app = 'client' }) => {
  const palette = mascotPalettes[app];

  if (variant === 'icon') {
    return (
      <Svg
        height={size}
        width={size}
        viewBox={`0 0 ${MASCOT_VIEWBOX} ${MASCOT_VIEWBOX}`}
        role="img"
        aria-label={title}
      >
        <Mascot app={app} />
      </Svg>
    );
  }

  // full wordmark — mascot on the left + "MOBOLULU" + "GO GREEN" tagline
  return (
    <Svg height={size * 2} width={size * 8} viewBox="0 0 640 200" role="img" aria-label={title}>
      <G transform={`translate(${MARK_OFFSET_X} ${MARK_OFFSET_Y}) scale(${MARK_SCALE})`}>
        <Mascot app={app} />
      </G>
      <SvgText x="184" y="132" fontSize="66" fontWeight="800" letterSpacing="0">
        <TSpan fill={palette.mid}>MOBOLULU</TSpan>
      </SvgText>
      <SvgText x="186" y="160" fontSize="19" fontWeight="700" letterSpacing="7" fill={palette.shade}>
        GO GREEN
      </SvgText>
    </Svg>
  );
};
