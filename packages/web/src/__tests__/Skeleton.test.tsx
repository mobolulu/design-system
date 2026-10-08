import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonList } from '../components/Skeleton';

describe('Skeleton', () => {
  it('renders a block at the requested size', () => {
    render(<Skeleton data-testid="sk" width={120} height={20} />);
    const node = screen.getByTestId('sk');
    expect(node.style.width).toBe('120px');
    expect(node.style.height).toBe('20px');
  });

  it('SkeletonCard announces as a loading indicator', () => {
    render(<SkeletonCard data-testid="sk-card" />);
    const node = screen.getByTestId('sk-card');
    expect(node.getAttribute('role')).toBe('progressbar');
    expect(node.getAttribute('aria-label')).toBe('Loading');
  });

  it('SkeletonList renders the requested number of rows', () => {
    render(<SkeletonList data-testid="sk-list" count={3} />);
    const list = screen.getByTestId('sk-list');
    expect(list.children).toHaveLength(3);
  });
});
