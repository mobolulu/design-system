import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon, ICON_NAMES, type IconName } from '../components/Icon';

// Every glyph the three Expo tab bars reference (MBLL-213). If a name is
// dropped from the set, the app that used it goes back to rendering an
// empty box — so pin the contract here, not just in the apps.
const REQUIRED: IconName[] = ['home', 'receipt', 'calendar', 'wallet', 'user', 'banknote', 'gate'];

// The onboarding slides (MBLL-331). Same contract: a dropped name is a
// slide with a blank space where its picture was, in all three apps.
const ONBOARDING: IconName[] = ['bag', 'truck', 'shield'];

// react-native-svg's host nodes normalise colours into an internal
// representation, so assert against the SVG elements themselves.
const drawn = () => [...screen.UNSAFE_queryAllByType(Path), ...screen.UNSAFE_queryAllByType(Circle)];
const stroked = () => drawn().filter((el) => el.props.stroke !== 'none');

describe('Icon', () => {
  it('ships every glyph the tab bars need', () => {
    for (const name of REQUIRED) {
      expect(ICON_NAMES).toContain(name);
    }
  });

  it('ships every glyph the onboarding slides need', () => {
    for (const name of ONBOARDING) {
      expect(ICON_NAMES).toContain(name);
    }
  });

  it.each([...REQUIRED, ...ONBOARDING])('renders %s with at least one drawn part', (name) => {
    render(<Icon name={name} />);
    expect(drawn().length).toBeGreaterThan(0);
  });

  it.each(ONBOARDING)('draws %s inside the shared 24-unit grid', (name) => {
    // One stroke-style set on one grid is the whole premise of this
    // component. A glyph whose coordinates run outside the viewBox clips at
    // the slide's 36dp size, which is only visible on a device.
    render(<Icon name={name} />);
    const coordinates = drawn().flatMap((part) =>
      part.props.d
        ? (String(part.props.d).match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
        : [Number(part.props.cx), Number(part.props.cy)],
    );
    expect(coordinates.length).toBeGreaterThan(0);
    for (const value of coordinates) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(24);
    }
  });

  it('paints every stroked part in the colour it is given', () => {
    render(<Icon name="home" color="#15803D" />);
    expect(stroked().length).toBeGreaterThan(0);
    for (const part of stroked()) {
      expect(part.props.stroke).toBe('#15803D');
    }
  });

  it('does not hardcode a colour — a second tint renders differently', () => {
    const { rerender } = render(<Icon name="home" color="#15803D" />);
    const active = stroked().map((p) => p.props.stroke);
    rerender(<Icon name="home" color="#94A3B8" />);
    const inactive = stroked().map((p) => p.props.stroke);
    expect(active).not.toEqual(inactive);
    expect(inactive.every((c) => c === '#94A3B8')).toBe(true);
  });

  it('sizes the square from the size prop and keeps a 24-unit viewBox', () => {
    render(<Icon name="wallet" size={32} />);
    const root = screen.UNSAFE_getByType(Svg);
    expect(root.props.width).toBe(32);
    expect(root.props.height).toBe(32);
    expect(root.props.viewBox).toBe('0 0 24 24');
  });

  it('applies strokeWidth so a focused tab can be weighted', () => {
    render(<Icon name="user" strokeWidth={2.25} />);
    expect(stroked().length).toBeGreaterThan(0);
    for (const part of stroked()) {
      expect(part.props.strokeWidth).toBe(2.25);
    }
  });

  it('stays out of the accessibility tree when it is decorative', () => {
    render(<Icon name="home" testID="plain" />);
    // Default queries skip a11y-hidden elements: a tab already announces
    // its own label, so the icon must not be read a second time.
    expect(screen.queryByTestId('plain')).toBeNull();
    const root = screen.UNSAFE_getByType(Svg);
    expect(root.props.accessible).toBe(false);
    expect(root.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('is announced when it is given a label', () => {
    render(<Icon name="home" accessibilityLabel="Home" testID="labelled" />);
    const node = screen.getByTestId('labelled');
    expect(node.props.accessible).toBe(true);
    expect(node.props.accessibilityLabel).toBe('Home');
  });

  it('draws accent dots filled rather than stroked', () => {
    render(<Icon name="calendar" color="#15803D" />);
    const dots = screen.UNSAFE_queryAllByType(Circle).filter((c) => c.props.fill === '#15803D');
    expect(dots).toHaveLength(3);
    for (const dot of dots) {
      expect(dot.props.stroke).toBe('none');
    }
  });
});
