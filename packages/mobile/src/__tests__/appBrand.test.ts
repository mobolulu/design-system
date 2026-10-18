import { appBrand, type AppBrandField } from '../tokens';

// MBLL-331 asks for text over a gradient and says in the same breath that
// contrast is part of it. A gradient has two ends, so "it looks fine" is
// measured at whichever end the reviewer happened to screenshot — this
// checks both ends of all three apps against the real WCAG 2.1 contrast
// formula, so a future nudge to any of the twelve hex values fails here
// instead of shipping unreadable copy to a trainee's handset.

/** WCAG 2.1 relative luminance of an #rrggbb colour. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two #rrggbb colours, 1–21. */
function contrast(a: string, b: string): number {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = '#FFFFFF';
// 1.4.3 Contrast (Minimum) for body-size text.
const AA_TEXT = 4.5;
// 1.4.11 Non-text Contrast, for the accent dot.
const AA_NON_TEXT = 3;

const apps = Object.entries(appBrand) as [string, AppBrandField][];

describe('appBrand fields', () => {
  it('covers exactly the three Expo apps', () => {
    expect(Object.keys(appBrand).sort()).toEqual(['client', 'collector', 'disposal']);
  });

  it.each(apps)('%s: every colour is a full six-digit hex', (_name, field) => {
    for (const value of Object.values(field)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  describe.each(apps)('%s', (_name, field) => {
    // Both ends, not just one: the hero sits over `deep` and the copy
    // nearest the panel sits over `mid`.
    it.each([
      ['deep', field.deep],
      ['mid', field.mid],
    ])('carries white body text on the %s end', (_end, background) => {
      expect(contrast(WHITE, background)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it.each([
      ['deep', field.deep],
      ['mid', field.mid],
    ])('carries tinted body text on the %s end', (_end, background) => {
      expect(contrast(field.tint, background)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it.each([
      ['deep', field.deep],
      ['mid', field.mid],
    ])('separates the accent from the %s end as a graphical element', (_end, background) => {
      expect(contrast(field.accent, background)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    // `tint` is the light splash colour and `deep`/`mid` the dark field.
    // If someone swaps a pair by accident the contrast assertions above
    // still pass — contrast is symmetric — and the screen renders dark
    // text on a light field with a white headline on top of it.
    it('keeps the tint lighter than both ends of the field', () => {
      expect(luminance(field.tint)).toBeGreaterThan(luminance(field.mid));
      expect(luminance(field.mid)).toBeGreaterThanOrEqual(luminance(field.deep));
    });
  });

  it('gives each app a visually distinct field', () => {
    const mids = apps.map(([, field]) => field.mid);
    expect(new Set(mids).size).toBe(mids.length);
  });
});

describe('the contrast helper itself', () => {
  // Three fixed points, so a bug in the formula above cannot quietly make
  // every assertion in this file pass.
  it('scores the WCAG reference pairs', () => {
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrast('#FFFFFF', '#767676')).toBeCloseTo(4.54, 1);
  });
});
