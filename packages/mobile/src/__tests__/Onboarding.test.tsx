import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Onboarding, type OnboardingSlide } from '../components/Onboarding';
import { appBrand } from '../tokens';

const WIDTH = 360;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: WIDTH, height: 800, scale: 2, fontScale: 1 }),
}));

const slides: OnboardingSlide[] = [
  { key: 'what', icon: 'bag', title: 'Bags, not kilograms', body: 'Tell us how many bags.' },
  { key: 'next', icon: 'truck', title: 'A collector comes', body: 'You pick who collects.' },
  { key: 'money', icon: 'shield', title: 'Your money is held', body: 'Released when you approve.' },
];

/** The pager settling on slide `index`, as the platform reports it. */
function swipeTo(index: number) {
  fireEvent(screen.getByTestId('onboarding.pager'), 'momentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: WIDTH * index, y: 0 },
      contentSize: { width: WIDTH * slides.length, height: 800 },
      layoutMeasurement: { width: WIDTH, height: 800 },
    },
  });
}

describe('Onboarding', () => {
  it('renders every slide, so a swipe never waits on a fetch', () => {
    render(<Onboarding slides={slides} onDone={jest.fn()} />);

    for (const slide of slides) {
      expect(screen.getByTestId(`onboarding.slide.${slide.key}`)).toBeTruthy();
      expect(screen.getByText(slide.title)).toBeTruthy();
      expect(screen.getByText(slide.body)).toBeTruthy();
    }
  });

  // The requirement is "skip reaches sign-in from any slide in one tap",
  // so every slide gets its own assertion rather than one for the first.
  it.each([0, 1, 2])('skips to sign-in in one tap from slide %i', (index) => {
    const onDone = jest.fn();
    render(<Onboarding slides={slides} onDone={onDone} />);

    swipeTo(index);
    fireEvent.press(screen.getByTestId('onboarding.skip'));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('gives skip a real touch target and a label of its own', () => {
    render(<Onboarding slides={slides} onDone={jest.fn()} />);
    const skip = screen.getByTestId('onboarding.skip');

    expect(skip.props.accessibilityLabel).toBe('Skip onboarding and sign in');
    const style = Array.isArray(skip.props.style) ? Object.assign({}, ...skip.props.style) : skip.props.style;
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('advances the dots as the user swipes', () => {
    render(<Onboarding slides={slides} onDone={jest.fn()} />);

    expect(screen.getByTestId('onboarding.dots').props.accessibilityLabel).toBe('Step 1 of 3');
    swipeTo(1);
    expect(screen.getByTestId('onboarding.dots').props.accessibilityLabel).toBe('Step 2 of 3');
    swipeTo(2);
    expect(screen.getByTestId('onboarding.dots').props.accessibilityLabel).toBe('Step 3 of 3');
  });

  it('shows one dot per slide so the user can see how many remain', () => {
    render(<Onboarding slides={slides} onDone={jest.fn()} />);

    expect(screen.getByTestId('onboarding.dots.0.active')).toBeTruthy();
    expect(screen.getByTestId('onboarding.dots.1')).toBeTruthy();
    expect(screen.getByTestId('onboarding.dots.2')).toBeTruthy();
  });

  it('steps forward on Next and finishes on the last slide', () => {
    const onDone = jest.fn();
    render(<Onboarding slides={slides} onDone={onDone} finishLabel="Sign in" />);

    expect(screen.getByText('Next')).toBeTruthy();

    fireEvent.press(screen.getByTestId('onboarding.next'));
    expect(screen.getByTestId('onboarding.dots').props.accessibilityLabel).toBe('Step 2 of 3');
    expect(onDone).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('onboarding.next'));
    expect(screen.getByText('Sign in')).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('onboarding.next'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('ignores a settle position past the last slide', () => {
    render(<Onboarding slides={slides} onDone={jest.fn()} />);

    swipeTo(9);

    expect(screen.getByTestId('onboarding.dots').props.accessibilityLabel).toBe('Step 3 of 3');
  });

  it('draws the field of the app it is told, not always the client green', () => {
    const { rerender } = render(<Onboarding slides={slides} onDone={jest.fn()} brand="collector" />);
    const fieldStyle = (brandTestId: string) => {
      const style = screen.getByTestId(brandTestId).props.style;
      return Object.assign({}, ...(Array.isArray(style) ? style.flat() : [style]));
    };

    expect(fieldStyle('onboarding.field').backgroundColor).toBe(appBrand.collector.mid);

    rerender(<Onboarding slides={slides} onDone={jest.fn()} brand="disposal" />);
    expect(fieldStyle('onboarding.field').backgroundColor).toBe(appBrand.disposal.mid);
  });

  it('works with the shorter two-slide deck the worker apps use', () => {
    const onDone = jest.fn();
    const worker = slides.slice(0, 2);
    render(<Onboarding slides={worker} onDone={onDone} />);

    expect(screen.getByTestId('onboarding.dots').props.accessibilityLabel).toBe('Step 1 of 2');
    fireEvent.press(screen.getByTestId('onboarding.next'));
    expect(screen.getByText('Get started')).toBeTruthy();
    fireEvent.press(screen.getByTestId('onboarding.next'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
