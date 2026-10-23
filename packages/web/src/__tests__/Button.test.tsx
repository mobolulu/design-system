import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/Button';

describe('Button', () => {
  it('renders its label and fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Confirm load</Button>);
    screen.getByRole('button', { name: 'Confirm load' }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fullWidth stretches to the full width of its container', () => {
    render(<Button fullWidth>Submit</Button>);
    expect(screen.getByRole('button', { name: 'Submit' }).className).toContain('w-full');
  });

  it('grow shares the row equally with its siblings instead of claiming it', () => {
    render(<Button grow>Accept</Button>);
    const button = screen.getByRole('button', { name: 'Accept' });
    expect(button.className).toContain('flex-1');
    expect(button.className).not.toContain('w-full');
  });

  it('asChild renders a single element carrying the button classes, with no Slot throw', () => {
    expect(() =>
      render(
        <Button asChild variant="primary">
          <a href="/">Back</a>
        </Button>,
      ),
    ).not.toThrow();

    const link = screen.getByRole('link', { name: 'Back' });
    expect(link.tagName).toBe('A');
    expect(link.className).toContain('bg-primary');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
