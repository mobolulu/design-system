// react-native-reanimated ships a jest mock that replaces worklets with
// plain synchronous JS so animated components mount and respond to events
// without a native runtime. The shipped mock doesn't include
// `useReducedMotion` yet (its source literally says "ADD ME IF NEEDED"), so
// extend it — tests exercise the non-reduced-motion path.
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: () => false,
}));

// `nativewind`'s own module graph pulls in Metro/platform-detection code
// that assumes a real Metro bundler or browser, neither of which exist under
// Jest. className resolution already isn't exercised in this package's
// tests (see Button.test.tsx asserting raw `className` strings) — only the
// `cssInterop` registration call site matters here, so stub it out.
jest.mock('nativewind', () => ({ cssInterop: jest.fn() }));

// expo-haptics talks to a native module that doesn't exist under jest; the
// design system only needs the calls to be safe no-ops in tests.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
