import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Skeleton, SkeletonCard, SkeletonList } from '../components/Skeleton';

describe('Skeleton', () => {
  it('renders a block at the requested size', () => {
    render(<Skeleton testID="sk" width={120} height={20} />);
    const node = screen.getByTestId('sk');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 120, height: 20 })]),
    );
  });

  it('SkeletonCard announces as a loading indicator', () => {
    render(<SkeletonCard testID="sk-card" />);
    const node = screen.getByTestId('sk-card');
    expect(node.props.accessibilityRole).toBe('progressbar');
    expect(node.props.accessibilityLabel).toBe('Loading');
  });

  it('SkeletonList renders the requested number of rows', () => {
    render(<SkeletonList testID="sk-list" count={3} />);
    const list = screen.getByTestId('sk-list');
    expect(list.children).toHaveLength(3);
  });
});
