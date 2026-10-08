import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';

describe('EmptyState', () => {
  it('renders the title and optional description', () => {
    render(<EmptyState title="No orders yet" description="New orders show up here." />);
    expect(screen.getByRole('heading', { name: 'No orders yet' })).toBeInTheDocument();
    expect(screen.getByText('New orders show up here.')).toBeInTheDocument();
  });

  it('renders the icon and action when given', () => {
    render(
      <EmptyState
        title="No collectors nearby"
        icon={<span>📍</span>}
        action={<Button>Retry</Button>}
      />,
    );
    expect(screen.getByText('📍')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('omits the description when none is given', () => {
    render(<EmptyState title="No collectors nearby" />);
    expect(screen.queryByText(/show up here/)).not.toBeInTheDocument();
  });
});
