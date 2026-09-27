import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PendingSyncBadge } from '../components/PendingSyncBadge';

describe('PendingSyncBadge', () => {
  it('renders nothing when the queue is empty', () => {
    render(<PendingSyncBadge count={0} itemName="scan" />);
    expect(screen.queryByText(/waiting to send/i)).toBeNull();
  });

  it('shows the queued count with a plural noun', () => {
    render(<PendingSyncBadge count={3} itemName="scan" />);
    expect(screen.getByText('3 scans waiting to send')).toBeTruthy();
  });

  it('uses the singular noun for one item', () => {
    render(<PendingSyncBadge count={1} itemName="pickup" itemPlural="pickups" />);
    expect(screen.getByText('1 pickup waiting to send')).toBeTruthy();
  });

  it('exposes the state to screen readers', () => {
    render(<PendingSyncBadge count={2} itemName="photo" />);
    expect(screen.getByLabelText('2 photos waiting to send')).toBeTruthy();
  });
});
