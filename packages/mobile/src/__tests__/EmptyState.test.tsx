import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';

describe('EmptyState', () => {
  it('renders the title and optional description', () => {
    render(<EmptyState title="No orders yet" description="New orders show up here." />);
    expect(screen.getByText('No orders yet')).toBeTruthy();
    expect(screen.getByText('New orders show up here.')).toBeTruthy();
  });

  it('renders the icon and action when given', () => {
    render(
      <EmptyState
        title="No collectors nearby"
        icon={<Text>📍</Text>}
        action={<Button onPress={() => {}}>Retry</Button>}
      />,
    );
    expect(screen.getByText('📍')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });
});
