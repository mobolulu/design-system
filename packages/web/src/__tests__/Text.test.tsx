import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from '../components/Text';

describe('Text', () => {
  it('defaults to the body role, rendered as a span', () => {
    render(<Text>Hello</Text>);
    const node = screen.getByText('Hello');
    expect(node.tagName).toBe('SPAN');
    expect(node.className).toContain('text-base');
  });

  it('applies tabular figures for the numeric role', () => {
    render(<Text variant="numeric">Rp 50.000</Text>);
    expect(screen.getByText('Rp 50.000').className).toContain('tabular-nums');
  });

  it('resolves a status tone to a concrete color class', () => {
    render(<Text tone="error">Failed</Text>);
    expect(screen.getByText('Failed').className).toContain('text-destructive');
  });

  it('resolves a backend status string to the same tone mapping as Badge', () => {
    render(<Text status="FAILED">Failed</Text>);
    expect(screen.getByText('Failed').className).toContain('text-destructive');
  });

  it('renders the requested element for semantic headings', () => {
    render(
      <Text as="h2" variant="title">
        Collector summary
      </Text>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Collector summary' })).toBeInTheDocument();
  });
});
