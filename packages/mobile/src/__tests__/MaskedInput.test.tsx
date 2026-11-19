import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MaskedInput } from '../components/MaskedInput';
import { applyMask, maskCapacity, unmask } from '../lib/mask';

const KTP = '#### #### #### ####';

function Harness({ onDigits }: { onDigits?: (digits: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <MaskedInput
      testID="ktp"
      mask={KTP}
      value={value}
      onChangeValue={(digits) => {
        setValue(digits);
        onDigits?.(digits);
      }}
    />
  );
}

describe('mask helpers', () => {
  it('groups digits, with a separator only between digits', () => {
    expect(applyMask('', KTP)).toBe('');
    expect(applyMask('3578', KTP)).toBe('3578');
    expect(applyMask('35780', KTP)).toBe('3578 0');
    expect(applyMask('3578010909900001', KTP)).toBe('3578 0109 0990 0001');
    // More than the mask holds is cut.
    expect(applyMask('35780109099000019999', KTP)).toBe('3578 0109 0990 0001');
  });

  it('counts and strips', () => {
    expect(maskCapacity(KTP)).toBe(16);
    expect(unmask('3578-0109 0990.0001 77', KTP)).toBe('3578010909900001');
  });
});

describe('MaskedInput', () => {
  it('shows grouped digits and hands the call site digits only', () => {
    const onDigits = jest.fn();
    render(<Harness onDigits={onDigits} />);
    const field = () => screen.getByTestId('ktp');

    fireEvent.changeText(field(), '35780');
    expect(field().props.value).toBe('3578 0');
    expect(onDigits).toHaveBeenLastCalledWith('35780');
    expect(screen.getByText('5 / 16 digits')).toBeTruthy();
  });

  it('takes a pasted number with separators, and stops at the mask’s length', () => {
    const onDigits = jest.fn();
    render(<Harness onDigits={onDigits} />);
    fireEvent.changeText(screen.getByTestId('ktp'), '3578-0109-0990-0001-99');
    expect(screen.getByTestId('ktp').props.value).toBe('3578 0109 0990 0001');
    expect(onDigits).toHaveBeenLastCalledWith('3578010909900001');
    expect(screen.getByText('16 digits ✓')).toBeTruthy();
  });

  it('deletes a digit when backspace lands on a separator', () => {
    render(<Harness />);
    const field = () => screen.getByTestId('ktp');
    fireEvent.changeText(field(), '35780');
    expect(field().props.value).toBe('3578 0');
    // The caret sat after the space and backspace removed the space: the
    // text is one shorter, the digits are the same. The digit before the
    // separator goes, so the caret does not sit still.
    fireEvent.changeText(field(), '35780');
    expect(field().props.value).toBe('3578');
  });

  it('opens the number pad and offers the mask as its placeholder', () => {
    render(<Harness />);
    const field = screen.getByTestId('ktp');
    expect(field.props.keyboardType).toBe('number-pad');
    expect(field.props.placeholder).toBe('0000 0000 0000 0000');
  });

  it('lets an error or a hint replace the count', () => {
    render(<MaskedInput testID="ktp" mask={KTP} value="3578" onChangeValue={() => {}} error="Too short" />);
    expect(screen.getByText('Too short')).toBeTruthy();
    expect(screen.queryByText('4 / 16 digits')).toBeNull();
  });
});
