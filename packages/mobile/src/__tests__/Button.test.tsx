import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button', () => {
  it('renders its label and fires onPress', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Confirm load</Button>);
    fireEvent.press(screen.getByRole('button', { name: 'Confirm load' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const onPress = jest.fn();
    render(
      <Button disabled onPress={onPress}>
        Confirm load
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Confirm load' });
    expect(button.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not fire while loading', () => {
    const onPress = jest.fn();
    render(
      <Button loading onPress={onPress}>
        Confirm load
      </Button>,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('fullWidth stretches to the full width of its container', () => {
    render(<Button fullWidth>Submit</Button>);
    expect(screen.getByRole('button', { name: 'Submit' }).props.className).toContain(
      'self-stretch w-full',
    );
  });

  // MBLL-219: in a row, fullWidth is 100% of the row *each* — the siblings go
  // off the screen edge. `grow` is the row affordance and must not bring
  // w-full along with it.
  it('grow shares the row with its siblings instead of claiming it', () => {
    render(<Button grow>Accept</Button>);
    const className = screen.getByRole('button', { name: 'Accept' }).props.className;
    expect(className).toContain('flex-1');
    expect(className).not.toContain('w-full');
    expect(className).not.toContain('self-stretch');
  });

  it('is neither full-width nor growing by default', () => {
    render(<Button>Accept</Button>);
    const className = screen.getByRole('button', { name: 'Accept' }).props.className;
    expect(className).not.toContain('w-full');
    expect(className).not.toContain('flex-1');
  });

  it('applies the 56dp glove target for size="xl" (XCUT-NFR-007/008)', () => {
    render(<Button size="xl">Scan QR</Button>);
    // The 56dp height is on the press target; the larger text on the label.
    expect(screen.getByRole('button', { name: 'Scan QR' }).props.className).toContain('h-14');
    expect(screen.getByText('Scan QR').props.className).toContain('text-lg');
  });
});
