import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

// NativeWind only intercepts `className` on components it registers at
// import time from 'react-native' (View, Text, Pressable, ...). Reanimated's
// animated components are a different component identity, so each one
// needs an explicit cssInterop registration to keep resolving `className`
// (this is NativeWind's own documented pattern for third-party/animated
// components — see their "Animations" guide).
export const AnimatedView = Animated.View;
export const AnimatedScrollView = Animated.ScrollView;
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Cross-package duplicate `@types/react` identities (same root cause as the
// TS2742 workaround in Stack.tsx) make `cssInterop`'s declared parameter
// type structurally incompatible with any component type we can name here,
// even though it's the same runtime value — a type-only mismatch, not a
// real one. `any` is the deliberate escape hatch, not laziness.
const registerClassName = cssInterop as (component: any, config: { className: 'style' }) => void;
registerClassName(AnimatedView, { className: 'style' });
registerClassName(AnimatedScrollView, { className: 'style' });
registerClassName(AnimatedPressable, { className: 'style' });
