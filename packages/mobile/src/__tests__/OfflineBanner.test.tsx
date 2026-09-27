import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OfflineBanner } from '../components/OfflineBanner';

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    render(<OfflineBanner visible={false} />);
    expect(screen.queryByText(/saved on this phone/i)).toBeNull();
  });

  it('renders the reassurance message as an alert when offline', () => {
    const { toJSON } = render(<OfflineBanner visible />);
    expect(toJSON()?.props.accessibilityRole).toBe('alert');
    expect(screen.getByText(/saved on this phone/i)).toBeTruthy();
  });

  it('accepts a custom message', () => {
    render(<OfflineBanner visible message="Tidak ada koneksi" />);
    expect(screen.getByText('Tidak ada koneksi')).toBeTruthy();
  });
});
