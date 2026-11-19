import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import {
  MONTH_NAMES,
  daysInMonth,
  formatDateLong,
  parseIsoDate,
  toIsoDate,
  todayIso,
} from '../lib/dates';

export interface DateFieldProps {
  label?: string;
  /** `YYYY-MM-DD`, or null/empty while nothing is chosen. */
  value: string | null;
  /** Called with `YYYY-MM-DD` when the person confirms. */
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  /** The sheet's heading. Defaults to the label. */
  title?: string;
  /** Earliest year offered. Defaults to 1900. */
  minYear?: number;
  /** Latest date that can be confirmed, `YYYY-MM-DD`. Defaults to today —
   *  right for a date of birth or anything else that has already happened. */
  maxDate?: string;
  /** Where the year column starts when nothing is chosen yet. Defaults to
   *  25 years before `maxDate`, so most adults find theirs without a long
   *  scroll. */
  startYear?: number;
  disabled?: boolean;
  style?: object;
  testID?: string;
}

const ROW_HEIGHT = 44;
const VISIBLE_ROWS = 5;

/**
 * A date, chosen rather than typed: tap the field, pick day, month and year
 * from three columns, confirm. Built for dates far from today — a date of
 * birth — where a month-grid calendar means dozens of taps to reach the
 * year.
 *
 * Pure React Native: no native date-picker module, so it behaves the same
 * on both platforms and adds no dependency to the apps.
 *
 * Test ids, given `testID="dob"`: the field is `dob`; in the sheet,
 * `dob.day-9`, `dob.month-9`, `dob.year-1990`, `dob.done`, `dob.cancel`.
 */
export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  error,
  hint,
  title,
  minYear = 1900,
  maxDate,
  startYear,
  disabled = false,
  style,
  testID,
}) => {
  const limit = parseIsoDate(maxDate) ?? parseIsoDate(todayIso())!;
  const chosen = parseIsoDate(value);

  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<number | null>(chosen?.day ?? null);
  const [month, setMonth] = useState<number | null>(chosen?.month ?? null);
  const [year, setYear] = useState<number | null>(chosen?.year ?? null);

  // Every opening starts from the field's value, not from an abandoned pick.
  useEffect(() => {
    if (!open) return;
    setDay(chosen?.day ?? null);
    setMonth(chosen?.month ?? null);
    setYear(chosen?.year ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = limit.year; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [limit.year, minYear]);

  // 31 until a month says otherwise; a leap year is only assumed until a
  // year is chosen.
  const dayCount = month ? daysInMonth(year ?? 2000, month) : 31;
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  // Choosing February after the 31st moves the day to the month's last.
  useEffect(() => {
    if (day != null && day > dayCount) setDay(dayCount);
  }, [day, dayCount]);

  const complete = day != null && month != null && year != null;
  const picked = complete ? toIsoDate({ year: year!, month: month!, day: day! }) : null;
  const tooLate = picked != null && picked > toIsoDate(limit);
  const canConfirm = picked != null && !tooLate;

  const confirm = () => {
    if (!canConfirm || !picked) return;
    onChange(picked);
    setOpen(false);
  };

  const shown = formatDateLong(value);
  const yearToShow = year ?? startYear ?? limit.year - 25;

  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${shown || placeholder}` : shown || placeholder}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, error ? styles.fieldError : null, disabled ? styles.fieldDisabled : null]}
      >
        <Text style={[styles.value, !shown ? styles.placeholder : null]}>{shown || placeholder}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title ?? label ?? 'Select a date'}
        testID={testID ? `${testID}.sheet` : undefined}
        footer={
          <View style={styles.actions}>
            <Button
              variant="secondary"
              grow
              onPress={() => setOpen(false)}
              testID={testID ? `${testID}.cancel` : undefined}
            >
              Cancel
            </Button>
            <Button
              grow
              disabled={!canConfirm}
              onPress={confirm}
              testID={testID ? `${testID}.done` : undefined}
            >
              Done
            </Button>
          </View>
        }
      >
        <Text style={styles.preview}>
          {tooLate
            ? 'That date has not happened yet'
            : picked
              ? formatDateLong(picked)
              : 'Choose the day, month and year'}
        </Text>
        <View style={styles.columns}>
          <Column
            heading="Day"
            flex={2}
            items={days}
            selected={day}
            labelOf={(d) => String(d)}
            onSelect={setDay}
            idOf={(d) => (testID ? `${testID}.day-${d}` : undefined)}
          />
          <Column
            heading="Month"
            flex={4}
            items={MONTH_NAMES.map((_, i) => i + 1)}
            selected={month}
            labelOf={(m) => MONTH_NAMES[m - 1]}
            onSelect={setMonth}
            idOf={(m) => (testID ? `${testID}.month-${m}` : undefined)}
          />
          <Column
            heading="Year"
            flex={3}
            items={years}
            selected={year}
            scrollTo={yearToShow}
            labelOf={(y) => String(y)}
            onSelect={setYear}
            idOf={(y) => (testID ? `${testID}.year-${y}` : undefined)}
          />
        </View>
      </BottomSheet>
    </View>
  );
};
DateField.displayName = 'DateField';

function Column({
  heading,
  flex,
  items,
  selected,
  scrollTo,
  labelOf,
  onSelect,
  idOf,
}: {
  heading: string;
  flex: number;
  items: number[];
  selected: number | null;
  /** The item to bring into view on opening when nothing is selected. */
  scrollTo?: number;
  labelOf: (item: number) => string;
  onSelect: (item: number) => void;
  idOf: (item: number) => string | undefined;
}) {
  const ref = useRef<ScrollView>(null);
  const anchor = selected ?? scrollTo ?? null;
  const anchorIndex = anchor == null ? -1 : items.indexOf(anchor);
  // Two rows of context above the anchored row.
  const offset = Math.max(0, (anchorIndex - 2) * ROW_HEIGHT);

  // Position once, on mount — the sheet mounts its columns each time it
  // opens. Re-scrolling on every selection would yank the list from under
  // the finger.
  useEffect(() => {
    if (anchorIndex > 0) ref.current?.scrollTo({ y: offset, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex }}>
      <Text style={styles.columnHeading}>{heading}</Text>
      <ScrollView
        ref={ref}
        style={styles.column}
        contentOffset={{ x: 0, y: offset }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {items.map((item) => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              testID={idOf(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${heading} ${labelOf(item)}`}
              onPress={() => onSelect(item)}
              style={[styles.row, active ? styles.rowActive : null]}
            >
              <Text style={[styles.rowText, active ? styles.rowTextActive : null]}>{labelOf(item)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500', color: colors.neutral[900], marginBottom: 4 },
  field: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radii.md,
    backgroundColor: colors.brand.white,
    paddingHorizontal: 12,
  },
  fieldError: { borderColor: colors.status.error },
  fieldDisabled: { opacity: 0.5 },
  value: { fontSize: 15, color: colors.neutral[900] },
  placeholder: { color: colors.neutral[400] },
  chevron: { fontSize: 14, color: colors.neutral[500] },
  error: { fontSize: 11, color: colors.status.error, marginTop: 4 },
  hint: { fontSize: 11, color: colors.neutral[500], marginTop: 4 },
  preview: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: 12,
  },
  columns: { flexDirection: 'row', gap: 8 },
  columnHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: 6,
  },
  column: {
    height: ROW_HEIGHT * VISIBLE_ROWS,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    backgroundColor: colors.neutral[50],
  },
  row: { height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center', borderRadius: radii.sm },
  rowActive: { backgroundColor: colors.brand.primary },
  rowText: { fontSize: 15, color: colors.neutral[700] },
  rowTextActive: { color: colors.brand.white, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
});
