import type { MascotLayer } from './mascotPaths';

export type MascotPalette = Record<MascotLayer, string>;

/**
 * The admin console's livery — dark teal, distinct from the client/collector/
 * disposal mobile apps (`packages/mobile/src/components/mascotPalette.ts`),
 * since the console isn't one of those three apps. Sampled from the reference
 * mark attached to MBLL-507 (`outline`/`shade`/`mid`/`light` pixel-picked from
 * the PNG; `eye` came out `#F2CD63`, an exact match for the mobile palettes'
 * iris colour, confirming this is the same mascot trace in a new tone).
 *
 * MBLL-507 shipped this from a raster reference, not an approved vector swatch
 * — flag any correction to these hexes back to whoever owns the brand palette.
 */
export const adminMascotPalette: MascotPalette = {
  outline: '#13292A',
  shade: '#1F3F42',
  mid: '#3E6260',
  light: '#5A807F',
  white: '#FFFFFF',
  eye: '#F2CD63',
};

/**
 * Reversed form for the dark sidebar (`tone="light"`): the console has no
 * supplied "on-dark" artwork, so each shaded layer is lightened toward white
 * (55%) to keep the silhouette off the sidebar background — the un-lightened
 * `outline`/`shade` are dark enough to disappear against it. That background
 * is a `brand-dark` (`#166534`) to black gradient and the logo sits at its
 * top, so the colour to check legibility against is that dark green, not
 * black: the lift takes the darkest layer from ~2.1:1 to ~2.6:1 and `light`
 * to ~4.0:1 against it.
 * `white` (teeth/highlights) and `eye` (iris) are left untouched; MBLL-330
 * kept the iris the same yellow across every livery on purpose. Treat this as
 * an interim, documented derivation pending real design sign-off, same as
 * `adminMascotPalette` itself.
 */
export const adminMascotPaletteLight: MascotPalette = {
  outline: '#959F9F',
  shade: '#9AA9AA',
  mid: '#A8B8B7',
  light: '#B5C6C5',
  white: '#FFFFFF',
  eye: '#F2CD63',
};
