import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Screen } from '../components/Screen';

describe('Screen', () => {
  it('renders the title and children', () => {
    render(
      <Screen title="Wallet">
        <Text>Balance</Text>
      </Screen>,
    );
    expect(screen.getAllByText('Wallet').length).toBeGreaterThan(0);
    expect(screen.getByText('Balance')).toBeTruthy();
  });

  it('renders without a title', () => {
    render(
      <Screen>
        <Text>Step 2 of 3</Text>
      </Screen>,
    );
    expect(screen.getByText('Step 2 of 3')).toBeTruthy();
  });

  it('renders a banner between the title and the scrolling body', () => {
    render(
      <Screen title="Orders" banner={<Text>You are offline</Text>}>
        <Text>Order #1</Text>
      </Screen>,
    );
    expect(screen.getByText('You are offline')).toBeTruthy();
  });
});
