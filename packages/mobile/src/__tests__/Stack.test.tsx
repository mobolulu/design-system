import React from 'react';
import { render } from '@testing-library/react-native';
import { Stack, HStack, VStack } from '../components/Stack';
import { Button } from '../components/Button';
import { Text } from '../components/Text';

const rootClassName = (tree: ReturnType<typeof render>) =>
  (tree.toJSON() as { props: { className?: string } }).props.className;

describe('Stack', () => {
  it('lays out a column by default and a row on request', () => {
    expect(rootClassName(render(<Stack><Text>one</Text></Stack>))).toContain('flex-col');
    expect(rootClassName(render(<Stack direction="row"><Text>one</Text></Stack>))).toContain(
      'flex-row',
    );
  });

  it('VStack and HStack pin the direction regardless of what is passed', () => {
    expect(rootClassName(render(<VStack direction="row"><Text>one</Text></VStack>))).toContain(
      'flex-col',
    );
    expect(rootClassName(render(<HStack direction="column"><Text>one</Text></HStack>))).toContain(
      'flex-row',
    );
  });
});

// MBLL-219: a row of fullWidth buttons renders fine in a unit test, because a
// test has no screen edge — that is how it shipped four times across two
// apps. The row Stack is the one place that can see the combination, so in
// dev it says so.
describe('Stack direction="row" warns about fullWidth children', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('warns when a row child carries fullWidth', () => {
    render(
      <Stack direction="row">
        <Button fullWidth>Decline</Button>
        <Button fullWidth>Accept</Button>
      </Stack>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/2 child\(ren\) with fullWidth \(Button,Button\)/);
    expect(warn.mock.calls[0][0]).toMatch(/fullWidth is column-only/);
    expect(warn.mock.calls[0][0]).toMatch(/Use `grow` instead/);
  });

  it('stays quiet for a row of grow buttons', () => {
    render(
      <HStack>
        <Button grow>Decline</Button>
        <Button grow>Accept</Button>
      </HStack>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('stays quiet for a column of fullWidth buttons — that is the correct use', () => {
    render(
      <VStack>
        <Button fullWidth>Submit for verification</Button>
        <Button fullWidth>Cancel</Button>
      </VStack>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns once per mounted Stack, not once per render', () => {
    const row = (
      <Stack direction="row">
        <Button fullWidth>Bank account</Button>
      </Stack>
    );
    const tree = render(row);
    tree.rerender(row);
    tree.rerender(row);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
