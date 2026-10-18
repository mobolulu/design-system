import { appBrand, onFieldMuted, type AppBrandField } from '../tokens';

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

// MBLL-331, after looking at the render instead of the green tick. The
// inactive pagination dot was an `rgba(255,255,255,0.35)` literal inline in
// Onboarding.tsx — the one colour on the field that this file did not
// guard, because it was not one of appBrand's four keys. Sampling the
// pixels of mobile-client render 39120410702 put it at 2.24:1 against the
// client field: under 1.4.11, on the control whose whole purpose is showing
// how many slides remain.
//
// Alpha is composited here rather than asserted as a hex, because that is
// what the device actually does — the dot is translucent white over a
// gradient, so it has a different effective colour at each end of it.
describe('the muted mark on a brand field', () => {
  /** `rgba(r,g,b,a)` -> the opaque colour it resolves to over `background`. */
  function composite(rgba: string, background: string): string {
    const match = rgba.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (!match) throw new Error(`not an rgba() string: ${rgba}`);
    const [r, g, b] = [1, 2, 3].map((i) => Number(match[i]));
    const alpha = Number(match[4]);
    const under = [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16));
    const mix = [r, g, b].map((c, i) => Math.round(alpha * c + (1 - alpha) * under[i]));
    return `#${mix.map((c) => c.toString(16).padStart(2, '0').toUpperCase()).join('')}`;
  }

  it('is a parseable rgba string', () => {
    expect(onFieldMuted).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
  });

  describe.each(apps)('%s', (_name, field) => {
    it.each([
      ['deep', field.deep],
      ['mid', field.mid],
    ])('stays a visible UI element against the %s end', (_end, background) => {
      expect(contrast(composite(onFieldMuted, background), background)).toBeGreaterThanOrEqual(
        AA_NON_TEXT,
      );
    });
  });

  it('stays quieter than the active dot it sits beside', () => {
    // The indicator only reads as a position if the current dot is the
    // louder of the two. Raising the muted alpha to fix contrast must not
    // overshoot into "both dots look the same".
    for (const [, field] of apps) {
      const muted = contrast(composite(onFieldMuted, field.mid), field.mid);
      const active = contrast(field.accent, field.mid);
      expect(muted).toBeLessThan(active);
    }
  });

  it('would have failed at the alpha that shipped', () => {
    // The regression this file exists to prevent, pinned as a fact: the
    // old literal is genuinely under the floor, so the assertions above
    // are load-bearing rather than trivially true at any alpha.
    const shipped = 'rgba(255,255,255,0.35)';
    const worst = Math.min(
      ...apps.flatMap(([, field]) =>
        [field.deep, field.mid].map((bg) => contrast(composite(shipped, bg), bg)),
      ),
    );
    expect(worst).toBeLessThan(AA_NON_TEXT);
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
