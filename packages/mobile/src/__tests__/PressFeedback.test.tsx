import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PressFeedback } from '../components/PressFeedback';

describe('PressFeedback', () => {
  it('fires onPress and forwards press-in/press-out without losing the caller\'s handlers', () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    render(
      <PressFeedback testID="row" onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Text>Scan</Text>
      </PressFeedback>,
    );

    const target = screen.getByTestId('row');
    fireEvent(target, 'pressIn');
    fireEvent.press(target);
    fireEvent(target, 'pressOut');

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const onPress = jest.fn();
    render(
      <PressFeedback testID="row" disabled onPress={onPress}>
        <Text>Scan</Text>
      </PressFeedback>,
    );
    fireEvent.press(screen.getByTestId('row'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
