import React from 'react';
import { Text as RNText } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { PressFeedback } from '../components/PressFeedback';

// MBLL-186 rendered the three apps on a device and found every primary
// Button invisible, every Screen title jammed against the left edge, and
// skeletons with no geometry. One cause: `cssInterop(…, { className:
// 'style' })` was registered on Reanimated's animated components, which
// took ownership of their `style` prop — callers passing `style` lost it,
// callers passing `className` never got it.
//
// This suite cannot catch that directly: jest.setup.js stubs `cssInterop`
// to a no-op, so under test the registration never happens and everything
// looks fine. That stub is exactly why the bug shipped. These tests guard
// the structural property that survives the stub — classes and styles are
// handed to components that React Native and NativeWind style natively,
// rather than to an animated component that needs a registration to work.

describe('className and style reach components that can apply them', () => {
  it('puts a Button class on a plain Pressable, not on an animated wrapper', () => {
    render(<Button size="xl">Scan QR</Button>);
    const pressable = screen.getByRole('button', { name: 'Scan QR' });

    // The classes that make it look like a button at all.
    expect(pressable.props.className).toContain('bg-primary');
    expect(pressable.props.className).toContain('h-14');
    // and it is the press target itself that carries them, not some
    // wrapper: an animated component created via createAnimatedComponent
    // does not resolve className on its own.
    expect(pressable.props.onStartShouldSetResponder).toBeDefined();
  });

  it('keeps the press target styled when PressFeedback is given both className and style', () => {
    render(
      <PressFeedback testID="row" className="bg-card p-4" style={{ marginTop: 8 }}>
        <RNText>Scan</RNText>
      </PressFeedback>,
    );
    const target = screen.getByTestId('row');
    expect(target.props.className).toBe('bg-card p-4');
    // The caller's style survives alongside the press-state style the
    // component layers on top of it.
    expect(flatten(target.props.style).marginTop).toBe(8);
  });

  it('applies press feedback on the press target itself, with no extra node', () => {
    render(
      <PressFeedback testID="row" className="bg-primary">
        <RNText>Scan</RNText>
      </PressFeedback>,
    );
    const target = screen.getByTestId('row');
    // Unpressed: nothing layered on.
    expect(flatten(target.props.style).opacity).toBeUndefined();

    fireEvent(target, 'pressIn');
    const pressedStyle = flatten(screen.getByTestId('row').props.style);
    expect(pressedStyle.opacity).toBeLessThan(1);

    fireEvent(target, 'pressOut');
    expect(flatten(screen.getByTestId('row').props.style).opacity).toBeUndefined();
  });

  it('keeps the Screen title inside the page gutter', () => {
    render(<Screen title="Profile"><RNText>body</RNText></Screen>);
    // Screen renders the title twice — the large inline one and the
    // compact header it collapses into. The large one sits in a row whose
    // horizontal padding is a plain StyleSheet value; if that does not
    // survive to the rendered node, the title sits hard against the edge.
    const gutters = screen.getAllByText('Profile').map((node) => {
      let current: typeof node | null = node;
      for (let depth = 0; current && depth < 6; depth += 1) {
        const padding = flatten(current.props?.style).paddingHorizontal;
        if (typeof padding === 'number' && padding > 0) return padding;
        current = current.parent as typeof node | null;
      }
      return 0;
    });
    expect(Math.max(...gutters)).toBeGreaterThan(0);
  });

  it('gives a Skeleton its geometry and its fill', () => {
    render(<Skeleton testID="sk" width={120} height={12} />);
    const flat = flatten(screen.getByTestId('sk').props.style);
    expect(flat.width).toBe(120);
    expect(flat.height).toBe(12);
    // A skeleton with no fill is an invisible one, so the colour is a token
    // rather than a class the animated component may never resolve.
    expect(flat.backgroundColor).toBeTruthy();
  });

  it('never puts a screen title on the display role, whatever its length', () => {
    // MBLL-186: `display` is 34/800, sized for a numeric hero. "Withdrawal
    // destination" on it wrapped onto two lines and ate ~80dp before any
    // content. A screen title is `title` when short and `heading` when
    // sentence-shaped; it is never `display`.
    for (const t of ['Earnings', 'Withdrawal destination']) {
      render(<Screen title={t}><RNText>body</RNText></Screen>);
      for (const node of screen.getAllByText(t)) {
        expect(flatten(node.props.style).fontSize).not.toBe(34);
      }
      screen.unmount();
    }
  });

  it('keeps a short title large and drops a sentence-shaped one a step', () => {
    render(<Screen title="Earnings"><RNText>body</RNText></Screen>);
    const short = Math.max(
      ...screen.getAllByText('Earnings').map((n) => Number(flatten(n.props.style).fontSize) || 0),
    );
    screen.unmount();

    render(<Screen title="Withdrawal destination"><RNText>body</RNText></Screen>);
    const long = Math.max(
      ...screen.getAllByText('Withdrawal destination').map(
        (n) => Number(flatten(n.props.style).fontSize) || 0,
      ),
    );

    expect(short).toBe(28);
    expect(long).toBe(20);
  });

  it('keeps a title that fits at 320dp on the larger role', () => {
    // The constant moved from 14 to 19 once it was derived at the narrowest
    // device we support rather than at the one the render lane uses
    // (MBLL-186). "Pay your pickup" is 15 characters on a money screen and
    // was dropping two steps with room to spare at every width we ship.
    render(<Screen title="Pay your pickup"><RNText>body</RNText></Screen>);
    const size = Math.max(
      ...screen.getAllByText('Pay your pickup').map(
        (n) => Number(flatten(n.props.style).fontSize) || 0,
      ),
    );
    expect(size).toBe(28);
  });

  it('still demotes a title that would wrap at 320dp', () => {
    // 21 characters: fits the 328dp the lane renders at, wraps the 288dp a
    // 320dp device leaves. The floor is what the constant is derived at.
    render(<Screen title="Choose your collector"><RNText>body</RNText></Screen>);
    const size = Math.max(
      ...screen.getAllByText('Choose your collector').map(
        (n) => Number(flatten(n.props.style).fontSize) || 0,
      ),
    );
    expect(size).toBe(20);
  });

  it('pads a Card by default, not only when asked for a non-default number', () => {
    render(
      <Card testID="card">
        <RNText>body</RNText>
      </Card>,
    );
    // The default was skipped — `padding !== 16 ? { padding } : undefined` —
    // and no className carries a padding utility, so every card in all three
    // apps rendered its contents flush against its own border (MBLL-186).
    expect(flatten(screen.getByTestId('card').props.style).padding).toBe(16);
  });

  it('still honours an explicit padding, including zero', () => {
    render(
      <Card testID="tight" padding={0}>
        <RNText>body</RNText>
      </Card>,
    );
    expect(flatten(screen.getByTestId('tight').props.style).padding).toBe(0);
  });

  it('lets a caller override the padding through style, which comes last', () => {
    render(
      <Card testID="wide" style={{ padding: 24 }}>
        <RNText>body</RNText>
      </Card>,
    );
    expect(flatten(screen.getByTestId('wide').props.style).padding).toBe(24);
  });
});

function flatten(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...flatten(s) }), {});
  }
  return style as Record<string, unknown>;
}
