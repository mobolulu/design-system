import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DateField } from '../components/DateField';
import { daysInMonth, formatDateLong, parseIsoDate, toIsoDate } from '../lib/dates';

function Harness({
  initial = null,
  onPicked,
  maxDate = '2026-11-20',
}: {
  initial?: string | null;
  onPicked?: (value: string) => void;
  maxDate?: string;
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <DateField
      testID="dob"
      label="Date of birth"
      value={value}
      maxDate={maxDate}
      onChange={(next) => {
        setValue(next);
        onPicked?.(next);
      }}
    />
  );
}

const disabled = (testID: string) =>
  screen.getByTestId(testID).props.accessibilityState?.disabled === true;

describe('date helpers', () => {
  it('reads, writes and formats a calendar date', () => {
    expect(parseIsoDate('1990-09-09')).toEqual({ year: 1990, month: 9, day: 9 });
    expect(parseIsoDate('1990-02-30')).toBeNull();
    expect(parseIsoDate('09-09-1990')).toBeNull();
    expect(toIsoDate({ year: 1990, month: 9, day: 9 })).toBe('1990-09-09');
    expect(formatDateLong('1990-09-09')).toBe('9 September 1990');
    expect(formatDateLong(null)).toBe('');
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
  });
});

describe('DateField', () => {
  it('shows the placeholder, then the chosen date in words', () => {
    const onPicked = jest.fn();
    render(<Harness onPicked={onPicked} />);
    expect(screen.getByText('Select a date')).toBeTruthy();

    fireEvent.press(screen.getByTestId('dob'));
    fireEvent.press(screen.getByTestId('dob.day-9'));
    fireEvent.press(screen.getByTestId('dob.month-9'));
    fireEvent.press(screen.getByTestId('dob.year-1990'));
    fireEvent.press(screen.getByTestId('dob.done'));

    expect(onPicked).toHaveBeenCalledWith('1990-09-09');
    expect(screen.getByText('9 September 1990')).toBeTruthy();
    // The sheet has closed.
    expect(screen.queryByTestId('dob.done')).toBeNull();
  });

  it('cannot be confirmed until day, month and year are all chosen', () => {
    const onPicked = jest.fn();
    render(<Harness onPicked={onPicked} />);
    fireEvent.press(screen.getByTestId('dob'));
    fireEvent.press(screen.getByTestId('dob.day-9'));
    fireEvent.press(screen.getByTestId('dob.month-9'));
    fireEvent.press(screen.getByTestId('dob.done'));
    expect(onPicked).not.toHaveBeenCalled();
    expect(screen.getByText('Choose the day, month and year')).toBeTruthy();
  });

  it('moves the 31st to the last day of a shorter month', () => {
    const onPicked = jest.fn();
    render(<Harness onPicked={onPicked} />);
    fireEvent.press(screen.getByTestId('dob'));
    fireEvent.press(screen.getByTestId('dob.day-31'));
    fireEvent.press(screen.getByTestId('dob.year-1991'));
    fireEvent.press(screen.getByTestId('dob.month-2'));
    // February 1991 has 28 days: the 29th–31st are gone and the pick moved.
    expect(screen.queryByTestId('dob.day-29')).toBeNull();
    fireEvent.press(screen.getByTestId('dob.done'));
    expect(onPicked).toHaveBeenCalledWith('1991-02-28');
  });

  it('refuses a date after maxDate, and offers no year past it', () => {
    const onPicked = jest.fn();
    render(<Harness onPicked={onPicked} />);
    fireEvent.press(screen.getByTestId('dob'));
    expect(screen.queryByTestId('dob.year-2027')).toBeNull();
    fireEvent.press(screen.getByTestId('dob.day-21'));
    fireEvent.press(screen.getByTestId('dob.month-11'));
    fireEvent.press(screen.getByTestId('dob.year-2026'));
    expect(screen.getByText('That date has not happened yet')).toBeTruthy();
    fireEvent.press(screen.getByTestId('dob.done'));
    expect(onPicked).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('dob.day-20'));
    fireEvent.press(screen.getByTestId('dob.done'));
    expect(onPicked).toHaveBeenCalledWith('2026-11-20');
  });

  it('reopens on the field’s value, and Cancel keeps it', () => {
    const onPicked = jest.fn();
    render(<Harness initial="1990-09-09" onPicked={onPicked} />);
    fireEvent.press(screen.getByTestId('dob'));
    expect(screen.getByTestId('dob.day-9').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('dob.year-1990').props.accessibilityState.selected).toBe(true);

    fireEvent.press(screen.getByTestId('dob.day-10'));
    fireEvent.press(screen.getByTestId('dob.cancel'));
    expect(onPicked).not.toHaveBeenCalled();
    expect(screen.getByText('9 September 1990')).toBeTruthy();

    // The abandoned pick is not remembered.
    fireEvent.press(screen.getByTestId('dob'));
    expect(screen.getByTestId('dob.day-9').props.accessibilityState.selected).toBe(true);
  });

  it('does not open when disabled', () => {
    render(<DateField testID="dob" value={null} onChange={() => {}} disabled />);
    expect(disabled('dob')).toBe(true);
    fireEvent.press(screen.getByTestId('dob'));
    expect(screen.queryByTestId('dob.done')).toBeNull();
  });
});
