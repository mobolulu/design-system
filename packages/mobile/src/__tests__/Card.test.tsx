import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Card } from '../components/Card';
import { elevation } from '../tokens';

describe('Card', () => {
  it('renders as a plain surface with the raised elevation by default', () => {
    render(
      <Card testID="card">
        <Text>Order #1042</Text>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(elevation.raised)]),
    );
  });

  it('applies the requested elevation level', () => {
    render(
      <Card testID="card" elevation="floating">
        <Text>FAB shadow</Text>
      </Card>,
    );
    expect(screen.getByTestId('card').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(elevation.floating)]),
    );
  });

  it('becomes pressable with feedback when onPress is given', () => {
    const onPress = jest.fn();
    render(
      <Card testID="card" onPress={onPress}>
        <Text>Tap me</Text>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card.props.accessibilityRole ?? card.props.role).toBeTruthy();
    fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
