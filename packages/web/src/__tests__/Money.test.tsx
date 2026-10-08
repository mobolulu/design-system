import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Money } from '../components/Money';

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
});
