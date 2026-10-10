// Money and bag-count formatting — one implementation for every app
// (MBLL-38). Money arrives from the backend as integer minor units of
// rupiah (Rp 50,000 is 50000; @mobolulu/shared `MoneyMinor`, architecture
// §5) and is never floating point. Formatting must refuse a fractional
// amount rather than round it: a rounded display is a wrong number.
//
// Grouping follows the Indonesian convention — dots between thousands,
// no decimals (rupiah has none in practice).

/** Throws when `minor` is not an integer, so a fractional amount can never render. */
function assertIntegerMinor(minor: number): void {
  if (!Number.isInteger(minor)) {
    throw new TypeError(`Money must be an integer minor-unit amount, got ${minor}`);
  }
}

/** Groups an integer's digits with Indonesian dot separators: 50000 -> "50.000". Sign is the caller's job. */
function groupIndonesian(value: number): string {
  const digits = Math.abs(value).toString();
  let grouped = '';
  for (let i = 0; i < digits.length; i++) {
    const fromEnd = digits.length - i;
    grouped += digits[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) grouped += '.';
  }
  return grouped;
}

/** The sign of a minor-unit amount, as the character that goes in front of it (or ''). */
function signOf(value: number): string {
  return value < 0 ? '-' : '';
}

/**
 * Formats integer minor units of rupiah for display: `formatRupiah(50000)` →
 * `"Rp 50.000"`. The sign sits outermost — `formatRupiah(-70)` → `"-Rp 70"` —
 * matching Indonesian accounting convention and CLDR's `id` currency pattern.
 * Throws on non-integers — convert or fix the input instead.
 */
export function formatRupiah(minor: number): string {
  assertIntegerMinor(minor);
  return `${signOf(minor)}Rp ${groupIndonesian(minor)}`;
}

/**
 * Formats without the `Rp` prefix, for sentences that carry the currency
 * themselves ("pay Rp X from my balance" composes it inline):
 * `formatMinorUnits(12500)` → `"12.500"`.
 */
export function formatMinorUnits(minor: number): string {
  assertIntegerMinor(minor);
  return `${signOf(minor)}${groupIndonesian(minor)}`;
}

/** A count of bags of the standard size (XCUT-BR-002). Never fractional. */
export function formatBagCount(count: number): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new TypeError(`Bag count must be a non-negative integer, got ${count}`);
  }
  return groupIndonesian(count);
}
