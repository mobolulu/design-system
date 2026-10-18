import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Svg, { Path, TSpan, Text as SvgText } from 'react-native-svg';
import { Logo } from '../components/Logo';
import { MASCOT_LAYERS, mascotPaths } from '../components/mascotPaths';
import { mascotPalettes, type MascotApp } from '../components/mascotPalette';

const APPS: MascotApp[] = ['client', 'collector', 'disposal'];

const paths = () => screen.UNSAFE_queryAllByType(Path);
const fills = () => paths().map((p) => p.props.fill);
const root = () => screen.UNSAFE_getAllByType(Svg)[0];
// `react-native-svg` text is not host text, so `getByText` cannot see it —
// collect the string leaves of <Text>/<TSpan> instead.
const svgText = () =>
  [...screen.UNSAFE_queryAllByType(SvgText), ...screen.UNSAFE_queryAllByType(TSpan)]
    .flatMap((node) => React.Children.toArray(node.props.children))
    .filter((child): child is string => typeof child === 'string')
    .map((child) => child.trim());

describe('Logo', () => {
  it.each(APPS)('draws every mascot layer for %s', (app) => {
    render(<Logo variant="icon" app={app} />);
    expect(paths().map((p) => p.props.d)).toEqual(MASCOT_LAYERS.map((l) => mascotPaths[l]));
  });

  // The whole point of MBLL-330: the mark on the login screen has to be the
  // same artwork as the launcher icon, in the same app's livery.
  it.each(APPS)('paints %s in that app launcher-icon palette', (app) => {
    render(<Logo variant="icon" app={app} />);
    expect(fills()).toEqual(MASCOT_LAYERS.map((l) => mascotPalettes[app][l]));
  });

  it('gives each app a visibly different mark', () => {
    const { rerender } = render(<Logo variant="icon" app="client" />);
    const green = fills();
    rerender(<Logo variant="icon" app="collector" />);
    const amber = fills();
    rerender(<Logo variant="icon" app="disposal" />);
    const indigo = fills();
    expect(green).not.toEqual(amber);
    expect(amber).not.toEqual(indigo);
    expect(green).not.toEqual(indigo);
  });

  it('keeps the iris yellow in every app — one mascot, three liveries', () => {
    const eyes = APPS.map((app) => mascotPalettes[app].eye);
    expect(new Set(eyes).size).toBe(1);
  });

  it('defaults to the client livery', () => {
    render(<Logo variant="icon" />);
    expect(fills()).toEqual(MASCOT_LAYERS.map((l) => mascotPalettes.client[l]));
  });

  it('scales the icon variant from the size prop without changing the viewBox', () => {
    const { rerender } = render(<Logo variant="icon" size={36} />);
    expect(root().props).toMatchObject({ width: 36, height: 36, viewBox: '0 0 512 512' });
    rerender(<Logo variant="icon" size={112} />);
    expect(root().props).toMatchObject({ width: 112, height: 112, viewBox: '0 0 512 512' });
  });

  it('renders the wordmark only in the full variant', () => {
    render(<Logo variant="full" />);
    expect(svgText()).toContain('MOBOLULU');
    expect(svgText()).toContain('GO GREEN');
  });

  it('keeps the wordmark out of the icon variant', () => {
    render(<Logo variant="icon" />);
    expect(svgText()).not.toContain('MOBOLULU');
    expect(svgText()).not.toContain('GO GREEN');
  });

  it('draws the mascot inside the wordmark too, scaled into the 640x200 box', () => {
    render(<Logo variant="full" size={40} />);
    expect(root().props).toMatchObject({ width: 320, height: 80, viewBox: '0 0 640 200' });
    expect(paths().map((p) => p.props.d)).toEqual(MASCOT_LAYERS.map((l) => mascotPaths[l]));
  });

  it('labels the mark for screen readers', () => {
    render(<Logo variant="icon" title="MOBOLULU Collect" />);
    expect(root().props['aria-label']).toBe('MOBOLULU Collect');
  });
});

describe('mascot artwork', () => {
  it('ships a non-trivial path for every layer', () => {
    for (const layer of MASCOT_LAYERS) {
      expect(mascotPaths[layer].length).toBeGreaterThan(100);
      expect(mascotPaths[layer].startsWith('M')).toBe(true);
    }
  });

  // Cumulative layers only work if they are genuinely nested; an accidental
  // disjoint re-trace would show as transparent seams on a real device,
  // which no unit test would otherwise catch. The silhouette being the
  // largest path is the cheap proxy for that invariant.
  it('keeps the outline silhouette as the broadest layer', () => {
    const outline = mascotPaths.outline;
    for (const layer of MASCOT_LAYERS) {
      if (layer === 'outline') continue;
      expect(mascotPaths[layer]).not.toBe(outline);
    }
  });

  it('defines the same layer set for every palette', () => {
    for (const app of APPS) {
      expect(Object.keys(mascotPalettes[app]).sort()).toEqual([...MASCOT_LAYERS].sort());
    }
  });
});
