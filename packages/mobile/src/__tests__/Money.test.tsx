import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Money } from '../components/Money';

describe('Money', () => {
  it('formats integer minor units with grouped thousands and a Rp prefix', () => {
    render(<Money minor={50000} />);
    expect(screen.getByText('Rp')).toBeTruthy();
    expect(screen.getByText('50.000')).toBeTruthy();
  });

  it('hides the prefix when asked', () => {
    render(<Money minor={12500} showPrefix={false} />);
    expect(screen.queryByText('Rp')).toBeNull();
    expect(screen.getByText('12.500')).toBeTruthy();
  });

  it('throws on a fractional minor-unit amount, same as formatMinorUnits', () => {
    expect(() => render(<Money minor={50000.5} />)).toThrow();
  });
});
