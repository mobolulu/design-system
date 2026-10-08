import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ListRow } from '../components/ListRow';

describe('ListRow', () => {
  it('renders title and subtitle', () => {
    render(<ListRow title="Budi Santoso" subtitle="Collector · Online" />);
    expect(screen.getByText('Budi Santoso')).toBeTruthy();
    expect(screen.getByText('Collector · Online')).toBeTruthy();
  });

  it('is pressable and derives an accessibility label from title + subtitle', () => {
    const onPress = jest.fn();
    render(<ListRow testID="row" title="Order #1042" subtitle="2 bags" onPress={onPress} />);
    const row = screen.getByTestId('row');
    expect(row.props.accessibilityLabel).toBe('Order #1042, 2 bags');
    fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders trailing content and chevron when requested', () => {
    render(
      <ListRow title="Wallet" trailing={<Text>Rp 50.000</Text>} showChevron />,
    );
    expect(screen.getByText('Rp 50.000')).toBeTruthy();
    expect(screen.getByText('›')).toBeTruthy();
  });
});
