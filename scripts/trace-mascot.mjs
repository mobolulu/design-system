#!/usr/bin/env node
// Traces the MOBOLULU mascot (assets/mobolulu-mascot-1024.png, the owner's
// original) into the flat vector layers that `Logo` draws — MBLL-330.
//
// Why a trace and not a bundled PNG: `Logo` is rendered at 36px on the
// collector home header, 56px on every login screen, and larger in the
// showcase. A raster mark at those sizes either blurs or ships three
// densities per app; `react-native-svg` is already a dependency of the
// package and of all three apps, so vector costs nothing extra to render.
//
// The mascot has six flat tones. They are traced as CUMULATIVE masks —
// darkest first, each one a superset of the next — rather than as disjoint
// regions, so that wherever two traced boundaries disagree by a fraction of
// a pixel the darker layer shows through instead of a transparent seam.
// That matches the artwork, which is outlined in the darkest tone
// throughout. The eyes are the exception: yellow is not on the lightness
// ramp, so it is excluded from the cumulative masks and painted last, over
// the outline tone, which gives it the dark rim the original has.
//
// Usage:  node scripts/trace-mascot.mjs
// Writes: packages/mobile/src/components/mascotPaths.ts
//         assets/mobolulu-mascot.svg   (canonical single-file copy)
//
// Requires the root devDependencies `pngjs` and `potrace`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import potrace from 'potrace';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'assets', 'mobolulu-mascot-1024.png');
const TS_OUT = path.join(ROOT, 'packages', 'mobile', 'src', 'components', 'mascotPaths.ts');
const SVG_OUT = path.join(ROOT, 'assets', 'mobolulu-mascot.svg');

// The six tones of the owner's artwork, as RGB seeds. Every opaque pixel is
// assigned to its nearest seed; the artwork is flat-shaded, so this is a
// clean partition apart from antialiased edges, which land on one side or
// the other and are absorbed by the cumulative masks below.
const SEEDS = [
  [0x13, 0x27, 0x2e], // 0 outline  — strokes, mouth interior, pupils
  [0x25, 0x3f, 0x40], // 1 shade    — lid top, deepest body shadow
  [0x41, 0x5e, 0x5c], // 2 mid      — shadowed body faces
  [0x5c, 0x7a, 0x78], // 3 light    — lit body faces
  [0xff, 0xff, 0xff], // 4 white    — highlight ring, teeth
  [0xf2, 0xcd, 0x63], // 5 eye      — iris
];

export const LAYERS = [
  { key: 'outline', classes: [0, 1, 2, 3, 4, 5] },
  { key: 'shade', classes: [1, 2, 3, 4] },
  { key: 'mid', classes: [2, 3, 4] },
  { key: 'light', classes: [3, 4] },
  { key: 'white', classes: [4] },
  { key: 'eye', classes: [5] },
];

// Trace resolution. The source is 1024²; tracing it directly costs ~99 KB of
// path data for boundary noise invisible above 48px. Majority-vote
// downsampling to 320² before tracing cuts that to ~33 KB with no measurable
// fidelity loss (RMSE against the shipped launcher icon at 112px is 13.8
// either way — the residual is the flattening of the artwork's soft shading,
// not the curve count).
const TRACE_SIZE = 320;
const TURD_SIZE = 10;
const OPT_TOLERANCE = 1.2;
const DECIMALS = 2;

// Framing: the shipped launcher icons (MBLL-230) put the mascot's bounding
// box at 76% of canvas height, centred. `Logo`'s icon viewBox is 512², so
// the in-app mark is framed identically to the launcher icon it sits next to.
const VIEWBOX = 512;
const BBOX_HEIGHT_FRACTION = 0.76;

function readSource() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`missing ${path.relative(ROOT, SOURCE)} — the owner's 1024² mascot original`);
  }
  return PNG.sync.read(fs.readFileSync(SOURCE));
}

function classify(png) {
  const { width: w, height: h, data } = png;
  const labels = new Int8Array(w * h).fill(-1);
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    if (data[i + 3] < 128) continue;
    let best = 0;
    let bestDist = Infinity;
    for (let k = 0; k < SEEDS.length; k++) {
      const [r, g, b] = SEEDS[k];
      const dist = (data[i] - r) ** 2 + (data[i + 1] - g) ** 2 + (data[i + 2] - b) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = k;
      }
    }
    labels[p] = best;
  }
  return labels;
}

function opaqueBBox(png) {
  const { width: w, height: h, data } = png;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < 128) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1 };
}

/** Majority-vote downsample of one cumulative mask to a TRACE_SIZE bitmap. */
function maskBitmap(labels, sourceSize, classes) {
  const wanted = new Set(classes);
  const scale = sourceSize / TRACE_SIZE;
  const out = new PNG({ width: TRACE_SIZE, height: TRACE_SIZE });
  for (let y = 0; y < TRACE_SIZE; y++) {
    for (let x = 0; x < TRACE_SIZE; x++) {
      let on = 0;
      let total = 0;
      for (let sy = Math.floor(y * scale); sy < Math.floor((y + 1) * scale); sy++) {
        for (let sx = Math.floor(x * scale); sx < Math.floor((x + 1) * scale); sx++) {
          total++;
          if (wanted.has(labels[sy * sourceSize + sx])) on++;
        }
      }
      const v = on * 2 >= total ? 0 : 255;
      const i = (y * TRACE_SIZE + x) * 4;
      out.data[i] = v;
      out.data[i + 1] = v;
      out.data[i + 2] = v;
      out.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(out);
}

function trace(bitmap) {
  return new Promise((resolve, reject) => {
    const tracer = new potrace.Potrace({
      threshold: 128,
      turdSize: TURD_SIZE,
      alphaMax: 1.0,
      optCurve: true,
      optTolerance: OPT_TOLERANCE,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
    });
    tracer.loadImage(bitmap, (err) => {
      if (err) return reject(err);
      const match = /\sd="([^"]*)"/.exec(tracer.getPathTag());
      if (!match) return reject(new Error('potrace produced no path'));
      resolve(match[1]);
    });
  });
}

/** Maps trace-space coordinates into the 512² icon viewBox at launcher framing. */
function makeProjection(bbox, sourceSize) {
  const f = sourceSize / TRACE_SIZE;
  const bh = (bbox.y1 - bbox.y0 + 1) / f;
  const bw = (bbox.x1 - bbox.x0 + 1) / f;
  const scale = (VIEWBOX * BBOX_HEIGHT_FRACTION) / bh;
  const tx = VIEWBOX / 2 - (bbox.x0 / f + bw / 2) * scale;
  const ty = VIEWBOX / 2 - (bbox.y0 / f + bh / 2) * scale;
  return (d) => {
    let axis = 0;
    return d
      .replace(/-?\d+(\.\d+)?/g, (n) => {
        const v = parseFloat(n);
        const projected = axis++ % 2 === 0 ? v * scale + tx : v * scale + ty;
        return String(+projected.toFixed(DECIMALS));
      })
      .replace(/\s+/g, ' ')
      .trim();
  };
}

async function main() {
  const png = readSource();
  if (png.width !== png.height) throw new Error('mascot source must be square');
  const labels = classify(png);
  const project = makeProjection(opaqueBBox(png), png.width);

  const paths = {};
  for (const { key, classes } of LAYERS) {
    paths[key] = project(await trace(maskBitmap(labels, png.width, classes)));
  }

  const banner = [
    '// GENERATED by scripts/trace-mascot.mjs from assets/mobolulu-mascot-1024.png.',
    '// Do not edit by hand — re-run the script instead (MBLL-330).',
    '//',
    '// Cumulative layers, darkest first: each path is a superset of the next, so',
    '// painting them in order leaves no transparent seams between tones. `eye` is',
    '// painted last over the outline tone, which gives the iris its dark rim.',
    '',
  ].join('\n');

  const ts =
    `${banner}export const MASCOT_VIEWBOX = ${VIEWBOX};\n\n` +
    '/** Fraction of the viewBox the mascot bounding box fills — matches the launcher icons. */\n' +
    `export const MASCOT_BBOX_HEIGHT_FRACTION = ${BBOX_HEIGHT_FRACTION};\n\n` +
    'export const MASCOT_LAYERS = [\n' +
    LAYERS.map(({ key }) => `  '${key}',`).join('\n') +
    '\n] as const;\n\n' +
    'export type MascotLayer = (typeof MASCOT_LAYERS)[number];\n\n' +
    'export const mascotPaths: Record<MascotLayer, string> = {\n' +
    LAYERS.map(({ key }) => `  ${key}:\n    '${paths[key]}',`).join('\n') +
    '\n};\n';

  fs.writeFileSync(TS_OUT, ts);

  // Canonical single-file copy, in the client palette, alongside the other
  // brand marks in assets/.
  const clientPalette = {
    outline: '#08481F',
    shade: '#0C5E2A',
    mid: '#16823E',
    light: '#38B466',
    white: '#FFFFFF',
    eye: '#F2CD63',
  };
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" role="img" aria-label="MOBOLULU">\n` +
    LAYERS.map(({ key }) => `  <path fill="${clientPalette[key]}" fill-rule="evenodd" d="${paths[key]}"/>`).join('\n') +
    '\n</svg>\n';
  fs.writeFileSync(SVG_OUT, svg);

  const bytes = Object.values(paths).reduce((a, b) => a + b.length, 0);
  console.log(`traced ${LAYERS.length} layers, ${bytes} chars of path data`);
  for (const { key } of LAYERS) console.log(`  ${key.padEnd(8)} ${paths[key].length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
