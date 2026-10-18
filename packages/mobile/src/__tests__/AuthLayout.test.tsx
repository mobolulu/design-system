import React from 'react';
import { Text as RNText } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { AuthLayout } from '../components/AuthLayout';
import { BrandField } from '../components/BrandField';
import { appBrand, motion, textRoles } from '../tokens';

// AuthLayout starts an entry animation on mount, which drives RN Animated
// off timers. Under real timers those frames land outside `act` and every
// test in this file prints an update-not-wrapped warning; fake timers also
// make the one test that cares about the motion deterministic.
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

/** Flattens a possibly-nested RN style prop into one object. */
function flatten(style: unknown): Record<string, unknown> {
  const parts = (Array.isArray(style) ? style.flat(Infinity) : [style]).filter(Boolean);
  return Object.assign({}, ...(parts as object[]));
}

describe('BrandField', () => {
  it.each(Object.keys(appBrand) as (keyof typeof appBrand)[])(
    'falls back to %s solid brand colour under the gradient',
    (brand) => {
      // Not cosmetic: every contrast guarantee in appBrand is written
      // against a dark field. If the SVG layer does not draw and the
      // wrapper is transparent, white text lands on white.
      render(<BrandField brand={brand} testID="field" />);
      expect(flatten(screen.getByTestId('field').props.style).backgroundColor).toBe(appBrand[brand].mid);
    },
  );

  it('fills the viewport rather than sizing to its content', () => {
    render(<BrandField testID="field" />);
    expect(flatten(screen.getByTestId('field').props.style).flex).toBe(1);
  });

  it('renders its children on top of the field', () => {
    render(
      <BrandField testID="field">
        <RNText>on the field</RNText>
      </BrandField>,
    );
    expect(screen.getByText('on the field')).toBeTruthy();
  });
});

describe('AuthLayout', () => {
  const base = {
    wordmark: 'MOBOLULU',
    tagline: 'Book a waste pickup',
    supporting: 'Sign in with a one-time code',
  };

  it('uses three distinct type sizes above the form', () => {
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );

    const sizeOf = (text: string) => flatten(screen.getByText(text).props.style).fontSize;
    const sizes = [sizeOf(base.wordmark), sizeOf(base.tagline), sizeOf(base.supporting)];

    expect(sizes).toEqual([textRoles.display.fontSize, textRoles.heading.fontSize, textRoles.label.fontSize]);
    // Three sizes, not two — and strictly descending, which is the part
    // that makes it read as hierarchy rather than three arbitrary numbers.
    expect(new Set(sizes).size).toBe(3);
    expect(sizes[0]).toBeGreaterThan(sizes[1]);
    expect(sizes[1]).toBeGreaterThan(sizes[2]);
  });

  it('omits the supporting line when the app has nothing to put there', () => {
    render(
      <AuthLayout wordmark={base.wordmark} tagline={base.tagline}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    expect(screen.queryByText(base.supporting)).toBeNull();
  });

  it('renders the mark far larger than the 56px it replaced', () => {
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    // The Logo is an Svg; its width is the mark size.
    const mark = screen.getByLabelText(base.wordmark);
    expect(Number(mark.props.width)).toBeGreaterThanOrEqual(112);
  });

  it('honours a mark size override', () => {
    render(
      <AuthLayout {...base} markSize={96}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    expect(Number(screen.getByLabelText(base.wordmark).props.width)).toBe(96);
  });

  it('puts the form on a light panel, not on the dark field', () => {
    // OtpSignIn is shared and may not change here, and its classes assume a
    // light surface. If the panel ever goes dark the form goes invisible.
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    const panel = flatten(screen.getByTestId('auth.panel').props.style);
    expect(panel.backgroundColor).toBe('#F8FAFC');
    expect(screen.getByText('form')).toBeTruthy();
  });

  it('anchors the panel to the bottom edge instead of floating it', () => {
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    const panel = flatten(screen.getByTestId('auth.panel').props.style);

    // Rounded on top only, and no outer margin: a surface meeting the
    // screen edge, not a card adrift in a field.
    expect(panel.borderTopLeftRadius).toBeGreaterThan(0);
    expect(panel.borderTopRightRadius).toBeGreaterThan(0);
    expect(panel.borderBottomLeftRadius).toBeUndefined();
    expect(panel.borderBottomRightRadius).toBeUndefined();
    expect(panel.margin).toBeUndefined();
  });

  it('lets the hero shrink so the keyboard cannot push the form off screen', () => {
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    const hero = flatten(screen.getByTestId('auth.hero').props.style);
    expect(hero.flex).toBe(1);
  });

  it.each(Object.keys(appBrand) as (keyof typeof appBrand)[])('draws the %s field', (brand) => {
    render(
      <AuthLayout {...base} brand={brand}>
        <RNText>form</RNText>
      </AuthLayout>,
    );
    expect(flatten(screen.getByTestId('auth.field').props.style).backgroundColor).toBe(appBrand[brand].mid);
  });

  it('rises into place on mount and then stays there', () => {
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );

    const motionOf = (id: string) => {
      const style = flatten(screen.getByTestId(id).props.style) as {
        opacity: number;
        transform: { translateY: number }[];
      };
      return { opacity: style.opacity, translateY: style.transform[0].translateY };
    };

    // Starts hidden and offset — there is motion to play.
    expect(motionOf('auth.hero')).toEqual({ opacity: 0, translateY: 16 });
    expect(motionOf('auth.panel')).toEqual({ opacity: 0, translateY: 24 });

    act(() => jest.advanceTimersByTime(motion.duration.slow + motion.duration.fast + 50));

    expect(motionOf('auth.hero')).toEqual({ opacity: 1, translateY: 0 });
    expect(motionOf('auth.panel')).toEqual({ opacity: 1, translateY: 0 });

    // "Not a loop, not a spinner, nothing that repeats": a long way past
    // the end, the composition is exactly where it settled.
    act(() => jest.advanceTimersByTime(10_000));

    expect(motionOf('auth.hero')).toEqual({ opacity: 1, translateY: 0 });
    expect(motionOf('auth.panel')).toEqual({ opacity: 1, translateY: 0 });
  });

  it('staggers the panel behind the hero', () => {
    render(
      <AuthLayout {...base}>
        <RNText>form</RNText>
      </AuthLayout>,
    );

    // Mid-flight the hero is ahead of the panel, which is what makes the
    // entrance read as one movement rather than two things appearing.
    act(() => jest.advanceTimersByTime(motion.duration.fast + 40));

    const opacityOf = (id: string) => (flatten(screen.getByTestId(id).props.style) as { opacity: number }).opacity;
    expect(opacityOf('auth.hero')).toBeGreaterThan(opacityOf('auth.panel'));
  });
});
