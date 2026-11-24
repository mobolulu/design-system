import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ColorField, isHexColor, normalizeHexColor } from '../components/ColorField';

function Harness({ initial = '', onValue }: { initial?: string; onValue?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <ColorField
      label="Colour"
      value={value}
      onChange={(v) => {
        setValue(v);
        onValue?.(v);
      }}
      swatches={['#15803D', '#2563EB', '#DC2626']}
    />
  );
}

describe('isHexColor / normalizeHexColor', () => {
  it('accepts exactly #RRGGBB, in either case', () => {
    expect(isHexColor('#15803D')).toBe(true);
    expect(isHexColor('#15803d')).toBe(true);
    expect(isHexColor('15803D')).toBe(false);
    expect(isHexColor('#158')).toBe(false);
    expect(isHexColor('#15803DFF')).toBe(false);
    expect(isHexColor('#GGGGGG')).toBe(false);
  });

  it('upper-cases and adds the #', () => {
    expect(normalizeHexColor(' 15803d ')).toBe('#15803D');
    expect(normalizeHexColor('#abcdef')).toBe('#ABCDEF');
  });
});

describe('ColorField', () => {
  it('picks a swatch', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    fireEvent.click(screen.getByRole('radio', { name: '#2563EB' }));
    expect(onValue).toHaveBeenCalledWith('#2563EB');
    expect(screen.getByRole('radio', { name: '#2563EB' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Colour')).toHaveValue('#2563EB');
  });

  it('takes a typed hex once it is whole, upper-cased and with the # added', () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const box = screen.getByLabelText('Colour');
    fireEvent.change(box, { target: { value: 'ca8a' } });
    expect(onValue).not.toHaveBeenCalled();
    fireEvent.change(box, { target: { value: 'ca8a04' } });
    expect(onValue).toHaveBeenCalledWith('#CA8A04');
    expect(screen.getByTestId('color-field-preview')).toHaveStyle({ backgroundColor: '#CA8A04' });
  });

  it('says what is wrong with a malformed hex once the box is left', () => {
    render(<Harness initial="#15803D" />);
    const box = screen.getByLabelText('Colour');
    fireEvent.change(box, { target: { value: '#12' } });
    expect(screen.queryByText(/#RRGGBB/)).not.toBeInTheDocument();
    fireEvent.blur(box);
    expect(screen.getByText('Enter a colour as #RRGGBB, e.g. #15803D.')).toBeInTheDocument();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    // The value the form holds is still the last valid one.
    expect(screen.getByRole('radio', { name: '#15803D' })).toHaveAttribute('aria-checked', 'true');
  });

  it('a swatch clears the malformed draft', () => {
    render(<Harness />);
    const box = screen.getByLabelText('Colour');
    fireEvent.change(box, { target: { value: 'zz' } });
    fireEvent.blur(box);
    fireEvent.click(screen.getByRole('radio', { name: '#DC2626' }));
    expect(box).toHaveValue('#DC2626');
    expect(screen.queryByText(/Enter a colour/)).not.toBeInTheDocument();
  });

  it('follows a value set from outside', () => {
    const { rerender } = render(<ColorField label="Colour" value="#15803D" onChange={() => {}} />);
    rerender(<ColorField label="Colour" value="#2563EB" onChange={() => {}} />);
    expect(screen.getByLabelText('Colour')).toHaveValue('#2563EB');
  });

  it('shows the error the form passes', () => {
    render(<ColorField label="Colour" value="" onChange={() => {}} error="Pick a colour" />);
    expect(screen.getByText('Pick a colour')).toBeInTheDocument();
  });
});
