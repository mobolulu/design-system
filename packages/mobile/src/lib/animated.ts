import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

// Reanimated's animated components, plain and unregistered.
//
// These used to carry `cssInterop(…, { className: 'style' })` registrations
// so `className` would keep working on them. It did not work, and it broke
// the `style` prop as well — MBLL-186 rendered the apps on a device and
// found all three symptoms at once:
//
//   - `Button` lost its background and its height. The label kept its
//     colour (that is a plain RN `Text`), so a primary button rendered as
//     white text on a white card: invisible.
//   - `Screen`'s large title lost `styles.largeTitle`'s paddingHorizontal
//     and sat hard against the left edge, on every screen in every app.
//   - `Skeleton` passes its width, height and radius through `style`, so
//     loading placeholders lost their geometry too.
//
// The common thread is the interop taking ownership of `style` on these
// components: a caller that passes `style` and no `className` (Screen,
// BottomSheet) loses the style, and a caller that passes both
// (PressFeedback, Skeleton) loses the className-derived half. Removing the
// registrations gives `style` back to Reanimated, which is what every
// caller here actually needs — the two that wanted `className` now put it
// on a plain React Native component, which NativeWind styles correctly
// without any registration at all.
//
// `className` on these components is therefore inert by design. Do not
// re-add the registration without rendering a Button on a device and
// looking at it; the package's own tests cannot see this class of bug,
// because jest.setup.js stubs `cssInterop` out entirely.
export const AnimatedView = Animated.View;
export const AnimatedScrollView = Animated.ScrollView;
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
