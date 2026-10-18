import type { AppBrandName } from '../tokens';
import type { MascotLayer } from './mascotPaths';

/**
 * Which app a `Logo` is being rendered inside. MBLL-230 recoloured each app's
 * launcher icon from the same mascot — client green, collector amber,
 * disposal indigo — so the in-app mark has to follow suit or the home screen
 * and the login screen show two different brands (MBLL-330).
 *
 * Deliberately an alias of `AppBrandName` rather than its own union:
 * `AuthLayout` already takes a `brand`, and one app adding a second enum
 * here is how a screen ends up on an amber field with a green mark.
 */
export type MascotApp = AppBrandName;

export type MascotPalette = Record<MascotLayer, string>;

/**
 * Sampled from the shipped launcher icons (`assets/icon.png` in each app
 * repo), one representative value per tone. The iris is deliberately the
 * same yellow in all three — MBLL-230 left it unrecoloured, and that is what
 * makes the three marks read as one mascot in three liveries.
 */
export const mascotPalettes: Record<MascotApp, MascotPalette> = {
  client: {
    outline: '#08481F',
    shade: '#0C5E2A',
    mid: '#16823E',
    light: '#38B466',
    white: '#FFFFFF',
    eye: '#F2CD63',
  },
  collector: {
    outline: '#652404',
    shade: '#8A3506',
    mid: '#C4510D',
    light: '#E4883F',
    white: '#FFFFFF',
    eye: '#F2CD63',
  },
  disposal: {
    outline: '#1D1865',
    shade: '#27217E',
    mid: '#3C34AA',
    light: '#766BC5',
    white: '#FFFFFF',
    eye: '#F2CD63',
  },
};

// The tint each launcher icon sits on is NOT repeated here: it is already
// `appBrand[app].tint`, and the two matched exactly when sampled. A second
// copy is a second thing to keep in step.
