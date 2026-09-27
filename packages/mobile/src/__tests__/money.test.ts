import { formatRupiah, formatMinorUnits, formatBagCount } from '../money';

describe('formatRupiah', () => {
  it('formats integer minor units with Indonesian dot grouping', () => {
    expect(formatRupiah(50000)).toBe('Rp 50.000');
    expect(formatRupiah(1250)).toBe('Rp 1.250');
    expect(formatRupiah(999)).toBe('Rp 999');
    expect(formatRupiah(1200000)).toBe('Rp 1.200.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('keeps a negative sign in front (statements show deductions)', () => {
    expect(formatRupiah(-1500)).toBe('Rp -1.500');
  });

  it('refuses a fractional amount instead of rounding it', () => {
    expect(() => formatRupiah(50000.5)).toThrow(TypeError);
    expect(() => formatRupiah(Number.NaN)).toThrow(TypeError);
  });
});

describe('formatMinorUnits', () => {
  it('groups without the Rp prefix, for sentences carrying the currency', () => {
    expect(formatMinorUnits(12500)).toBe('12.500');
  });

  it('refuses fractional input', () => {
    expect(() => formatMinorUnits(0.5)).toThrow(TypeError);
  });
});

describe('formatBagCount', () => {
  it('formats a non-negative integer count', () => {
    expect(formatBagCount(0)).toBe('0');
    expect(formatBagCount(3)).toBe('3');
    expect(formatBagCount(1200)).toBe('1.200');
  });

  it('refuses fractional or negative counts', () => {
    expect(() => formatBagCount(1.5)).toThrow(TypeError);
    expect(() => formatBagCount(-1)).toThrow(TypeError);
  });
});
