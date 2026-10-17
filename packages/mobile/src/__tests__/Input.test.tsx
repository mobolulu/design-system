import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Input } from '../components/Input';

describe('Input', () => {
  // MBLL-311. Read the name literally: this asserts the four IME props reach
  // the underlying TextInput, i.e. that they are on the contract and are
  // forwarded. It does NOT assert that a keyboard honours them — that is a
  // property of the Android IME and of iOS UIKit, neither of which exists
  // under Jest. Nothing in CI, here or in any app repo, can prove the second
  // thing; the only evidence for it is a thumb on a real device.
  it('contract: forwards the IME props to TextInput (forwarding only — no keyboard is involved)', () => {
    render(
      <Input
        testID="field"
        value=""
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
      />,
    );

    const field = screen.getByTestId('field');
    expect(field.props.autoCapitalize).toBe('none');
    expect(field.props.autoCorrect).toBe(false);
    expect(field.props.autoComplete).toBe('off');
    expect(field.props.spellCheck).toBe(false);
  });

  // The component deliberately does not default these: autoCapitalize="sentences"
  // is right for a person's name and a street address, and those fields exist in
  // all three apps. Opting out is the call site's decision, so an unset prop has
  // to stay unset and let React Native's own default apply.
  it('leaves the IME props unset when the call site omits them, so React Native’s defaults stand', () => {
    render(<Input testID="field" value="" />);

    const field = screen.getByTestId('field');
    expect(field.props.autoCapitalize).toBeUndefined();
    expect(field.props.autoCorrect).toBeUndefined();
    expect(field.props.autoComplete).toBeUndefined();
    expect(field.props.spellCheck).toBeUndefined();
  });

  it('keeps keyboardType defaulting to "default"', () => {
    render(<Input testID="field" value="" />);
    expect(screen.getByTestId('field').props.keyboardType).toBe('default');
  });
});
