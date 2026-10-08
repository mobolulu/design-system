import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BottomSheet } from '../components/BottomSheet';

describe('BottomSheet', () => {
  it('renders its title and content when open', () => {
    render(
      <BottomSheet open onClose={() => {}} title="Confirm pickup">
        <Text>2 bags · Rp 10.000</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Confirm pickup')).toBeTruthy();
    expect(screen.getByText('2 bags · Rp 10.000')).toBeTruthy();
  });

  it('closes when the backdrop is pressed', () => {
    const onClose = jest.fn();
    render(
      <BottomSheet open onClose={onClose} testID="sheet">
        <Text>Choose a slot</Text>
      </BottomSheet>,
    );
    fireEvent.press(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the footer when given', () => {
    render(
      <BottomSheet open onClose={() => {}} footer={<Text>Confirm</Text>}>
        <Text>Body</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Confirm')).toBeTruthy();
  });
});
