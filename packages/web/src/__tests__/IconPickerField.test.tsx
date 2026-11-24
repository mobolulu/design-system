import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Check, Circle, Search } from 'lucide-react';
import { IconPickerField, type IconPickerOption } from '../components/IconPickerField';

const OPTIONS: IconPickerOption[] = [
  { key: 'leaf', label: 'Leaf', icon: Circle },
  { key: 'recycle', label: 'Recycle', icon: Check },
  { key: 'hazard', icon: Search },
];

function Harness({ initial = '', color, onValue }: { initial?: string; color?: string; onValue?: (k: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <IconPickerField
      label="Icon"
      options={OPTIONS}
      value={value}
      color={color}
      onChange={(k) => {
        setValue(k);
        onValue?.(k);
      }}
    />
  );
}

describe('IconPickerField', () => {
  it('offers exactly the passed icons, labelled (key when no label)', () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Icon' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label'))).toEqual([
      'Leaf',
      'Recycle',
      'hazard',
    ]);
  });

  it('picks an icon by click', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Recycle' }));
    expect(onValue).toHaveBeenCalledWith('recycle');
    expect(screen.getByRole('radio', { name: 'Recycle' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves through the grid with the arrow keys, wrapping, with one tab stop', () => {
    render(<Harness initial="recycle" />);
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Recycle' }), { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'hazard' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'hazard' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('radio', { name: 'hazard' }), { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Leaf' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Leaf' }), { key: 'End' });
    expect(screen.getByRole('radio', { name: 'hazard' })).toHaveAttribute('aria-checked', 'true');
  });

  it('previews every icon in the given colour', () => {
    render(<Harness color="#15803D" />);
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.querySelector('svg')).toHaveStyle({ color: '#15803D' });
    }
  });

  it('shows the error the form passes', () => {
    render(<IconPickerField label="Icon" options={OPTIONS} value="" onChange={() => {}} error="Pick an icon" />);
    expect(screen.getByText('Pick an icon')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });
});
