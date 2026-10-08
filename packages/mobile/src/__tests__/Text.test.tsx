import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from '../components/Text';
import { textRoles } from '../tokens';

describe('Text', () => {
  it('defaults to the body role', () => {
    render(<Text>Hello</Text>);
    const style = screen.getByText('Hello').props.style;
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ fontSize: textRoles.body.fontSize })]));
  });

  it('applies tabular figures for the numeric role', () => {
    render(<Text variant="numeric">Rp 50.000</Text>);
    const style = screen.getByText('Rp 50.000').props.style;
    expect(style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontVariant: ['tabular-nums'] })]),
    );
  });

  it('resolves a status tone to a concrete color', () => {
    render(<Text tone="error">Failed</Text>);
    const style = screen.getByText('Failed').props.style;
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ color: expect.any(String) })]));
  });
});
