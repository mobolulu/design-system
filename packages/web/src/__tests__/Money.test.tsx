import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Money } from '../components/Money';
import { formatRupiah, formatMinorUnits } from '../money';

describe('Money', () => {
  it('formats integer minor units with grouped thousands and a Rp prefix', () => {
    render(<Money minor={50000} />);
    expect(screen.getByText('Rp')).toBeInTheDocument();
    expect(screen.getByText('50.000')).toBeInTheDocument();
  });

  it('hides the prefix when asked', () => {
    render(<Money minor={12500} showPrefix={false} />);
    expect(screen.queryByText('Rp')).not.toBeInTheDocument();
    expect(screen.getByText('12.500')).toBeInTheDocument();
  });

  it('throws on a fractional minor-unit amount, same as formatMinorUnits', () => {
    expect(() => render(<Money minor={50000.5} />)).toThrow();
  });

  it('renders the amount with tabular figures by default', () => {
    render(<Money minor={50000} />);
    expect(screen.getByText('50.000').className).toContain('tabular-nums');
  });

  it('renders tabular figures even on a non-numeric variant', () => {
    render(<Money minor={50000} variant="heading" />);
    expect(screen.getByText('50.000').className).toContain('tabular-nums');
  });

  it('hoists a negative sign outside the Rp prefix: "-Rp 70", never "Rp -70"', () => {
    render(<Money minor={-7000} />);
    expect(screen.getByText('-Rp')).toBeInTheDocument();
    expect(screen.getByText('7.000')).toBeInTheDocument();
    expect(screen.queryByText('Rp')).not.toBeInTheDocument();
  });

  it('signed renders an explicit "+" for positive amounts, outside the prefix', () => {
    render(<Money minor={1000} signed />);
    expect(screen.getByText('+Rp')).toBeInTheDocument();
  });

  it('signed adds no sign to zero, and the real sign still wins over signed for negatives', () => {
    const zero = render(<Money minor={0} signed />);
    expect(screen.getByText('Rp')).toBeInTheDocument();
    zero.unmount();

    render(<Money minor={-500} signed />);
    expect(screen.getByText('-Rp')).toBeInTheDocument();
  });

  it('renders a real space between the prefix and the amount, not just layout — the joined text matches formatRupiah/formatMinorUnits exactly, for every sign', () => {
    for (const minor of [-150000, -1, 0, 1, 50000]) {
      const withPrefix = render(<Money minor={minor} />);
      expect(withPrefix.container.textContent).toBe(formatRupiah(minor));
      withPrefix.unmount();

      const withoutPrefix = render(<Money minor={minor} showPrefix={false} />);
      expect(withoutPrefix.container.textContent).toBe(formatMinorUnits(minor));
      withoutPrefix.unmount();
    }
  });
});
