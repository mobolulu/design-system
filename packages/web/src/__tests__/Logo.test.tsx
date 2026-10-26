import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../components/Logo';
import { MASCOT_LAYERS, mascotPaths } from '../components/mascotPaths';
import { adminMascotPalette, adminMascotPaletteLight } from '../components/mascotPalette';

const getPaths = (container: HTMLElement) => Array.from(container.querySelectorAll('path'));

describe('Logo', () => {
  it('draws every mascot layer in the icon variant', () => {
    const { container } = render(<Logo variant="icon" />);
    expect(getPaths(container).map((p) => p.getAttribute('d'))).toEqual(
      MASCOT_LAYERS.map((l) => mascotPaths[l]),
    );
  });

  it('paints the admin (teal) palette by default', () => {
    const { container } = render(<Logo variant="icon" />);
    expect(getPaths(container).map((p) => p.getAttribute('fill'))).toEqual(
      MASCOT_LAYERS.map((l) => adminMascotPalette[l]),
    );
  });

  it('switches to the lightened palette for tone="light"', () => {
    const { container } = render(<Logo variant="icon" tone="light" />);
    expect(getPaths(container).map((p) => p.getAttribute('fill'))).toEqual(
      MASCOT_LAYERS.map((l) => adminMascotPaletteLight[l]),
    );
  });

  it('keeps the iris yellow across both tones', () => {
    expect(adminMascotPalette.eye).toBe(adminMascotPaletteLight.eye);
  });

  it('renders no <defs> — the flat mascot fills need no gradient ids', () => {
    const { container } = render(<Logo variant="full" />);
    expect(container.querySelector('defs')).toBeNull();
  });

  it('does not collide when two Logos are mounted at once', () => {
    // Regression guard for the bug this component used to need useId() for:
    // duplicate url(#…) ids made the mark fall back to black. The current
    // flat-fill artwork has no ids to collide, so both instances should
    // render identical, correct fills.
    render(
      <>
        <Logo variant="icon" />
        <Logo variant="icon" />
      </>,
    );
    const fills = screen
      .getAllByRole('img')
      .map((svg) => Array.from(svg.querySelectorAll('path')).map((p) => p.getAttribute('fill')));
    expect(fills[0]).toEqual(MASCOT_LAYERS.map((l) => adminMascotPalette[l]));
    expect(fills[1]).toEqual(fills[0]);
  });

  it('renders the wordmark only in the full variant', () => {
    render(<Logo variant="full" />);
    expect(screen.getByText('MOBOLULU')).toBeInTheDocument();
    expect(screen.getByText('GO GREEN')).toBeInTheDocument();
  });

  it('keeps the wordmark out of the icon variant', () => {
    render(<Logo variant="icon" />);
    expect(screen.queryByText('MOBOLULU')).toBeNull();
  });

  it('labels the mark for screen readers, defaulting to MOBOLULU', () => {
    render(<Logo variant="icon" />);
    expect(screen.getByRole('img', { name: 'MOBOLULU' })).toBeInTheDocument();
  });

  it('accepts a caller-supplied accessible name', () => {
    render(<Logo variant="full" title="MOBOLULU Admin" />);
    expect(screen.getByRole('img', { name: 'MOBOLULU Admin' })).toBeInTheDocument();
  });
});
