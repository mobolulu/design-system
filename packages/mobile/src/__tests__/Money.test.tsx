import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Money } from '../components/Money';
import { formatRupiah, formatMinorUnits } from '../money';

/**
 * RN has no DOM `textContent`. This walks a rendered tree's JSON and joins
 * every string leaf in order, which is the closest equivalent — and is what
 * a screen reader or copy-paste would effectively see without the
 * `accessibilityLabel` `Money` sets.
 */
function extractText(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'children' in (node as Record<string, unknown>)) {
    return extractText((node as { children: unknown }).children);
  }
  return '';
}

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

  it('renders tabular figures even on a non-numeric variant', () => {
    render(<Money minor={50000} variant="heading" />);
    const amount = screen.getByText('50.000');
    const flattenedStyle = [amount.props.style].flat();
    expect(flattenedStyle.some((style) => style?.fontVariant?.includes('tabular-nums'))).toBe(true);
  });

  it('hoists a negative sign outside the Rp prefix: "-Rp 70", never "Rp -70"', () => {
    render(<Money minor={-7000} />);
    expect(screen.getByText('-Rp')).toBeTruthy();
    expect(screen.getByText('7.000')).toBeTruthy();
    expect(screen.queryByText('Rp')).toBeNull();
  });

  it('signed renders an explicit "+" for positive amounts, outside the prefix', () => {
    render(<Money minor={1000} signed />);
    expect(screen.getByText('+Rp')).toBeTruthy();
  });

  it('signed adds no sign to zero, and the real sign still wins over signed for negatives', () => {
    render(<Money minor={0} signed />);
    expect(screen.getByText('Rp')).toBeTruthy();

    screen.unmount();
    render(<Money minor={-500} signed />);
    expect(screen.getByText('-Rp')).toBeTruthy();
  });

  it("sets an accessibilityLabel carrying the full string, since sibling Text nodes read as unrelated to a screen reader", () => {
    render(<Money minor={-1500} />);
    expect(screen.getByLabelText('-Rp 1.500')).toBeTruthy();
  });

  it('renders a real space between the prefix and the amount, not just layout — the joined text matches formatRupiah/formatMinorUnits exactly, for every sign', () => {
    for (const minor of [-150000, -1, 0, 1, 50000]) {
      const withPrefix = render(<Money minor={minor} />);
      expect(extractText(withPrefix.toJSON())).toBe(formatRupiah(minor));
      withPrefix.unmount();

      const withoutPrefix = render(<Money minor={minor} showPrefix={false} />);
      expect(extractText(withoutPrefix.toJSON())).toBe(formatMinorUnits(minor));
      withoutPrefix.unmount();
    }
  });
});
