/**
 * Calendar dates as `YYYY-MM-DD` strings — a date of birth has no time and
 * no timezone, so none is ever attached to it here.
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export interface DateParts {
  year: number;
  /** 1–12. */
  month: number;
  day: number;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** `'1990-09-09'` → `{ year: 1990, month: 9, day: 9 }`; null if it is not a real date. */
export function parseIsoDate(value: string | null | undefined): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function toIsoDate({ year, month, day }: DateParts): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
}

/** `'1990-09-09'` → `'9 September 1990'`; an empty string if it is not a date. */
export function formatDateLong(value: string | null | undefined): string {
  const parts = parseIsoDate(value);
  return parts ? `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}` : '';
}

/** Today as a `YYYY-MM-DD` string, in the device's own timezone. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}
