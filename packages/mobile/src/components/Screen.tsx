import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { colors, spacing } from '../tokens';
import { Text } from './Text';
import { AnimatedView, AnimatedScrollView } from '../lib/animated';

const COLLAPSE_RANGE = 40;
const COMPACT_HEADER_HEIGHT = 44;

export interface ScreenProps {
  /** Large title shown inline at the top of the content; shrinks into a compact header bar as the user scrolls past it. Omit for a screen with no title (e.g. a modal step). */
  title?: string;
  /**
   * Content that sits below the title and above the scrolling body, and
   * never scrolls — an `OfflineBanner` or `PendingSyncBadge` belongs here.
   */
  banner?: React.ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. a FlatList-heavy list screen). */
  scroll?: boolean;
  /** Safe-area edges to inset. Defaults to top/left/right — most screens sit above a tab bar that already handles the bottom. */
  edges?: readonly Edge[];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  testID?: string;
  children: React.ReactNode;
}

/**
 * The page shell every screen was hand-rolling (MBLL-134): safe-area
 * handling, scroll, the standard gutter, and an optional large title that
 * collapses into a compact header as the user scrolls — the same primitive
 * everywhere makes thirteen screens look like one product instead of
 * thirteen slightly different ones.
 */
/**
 * Longest screen title that still fits one line at the `title` role.
 *
 * Derived, not chosen. MBLL-186 measured five titles off real renders at
 * `display` 34/800 and got 0.45–0.50 em per character (`My account` is the
 * widest at 0.5015; `Recurring pickups` came out at 266.0dp against a 266dp
 * prediction, so the model holds). 0.52 is used below as the conservative
 * bound above every sample.
 *
 * The width it is derived at is the decision, and it had never been made:
 * **the narrowest device these apps support is 320dp.** That is Android's
 * smallest common width bucket (`sw320dp`), and it leaves 288dp of content
 * inside Screen's 16dp gutters. At `title` 28/800:
 *
 *     288dp / (28 * 0.52 em) = 19.8 characters
 *
 * Hence 19. On the 360dp mid-range device the lane renders at there is
 * 328dp of content and the break-even is ~22, so 19 demotes two titles
 * ("Choose your collector", "Withdrawal destination") that would have fit
 * there. That is the price of the 320dp floor, and it is the right way
 * round: a title one step smaller reads fine, a wrapped one does not.
 *
 * It is still a character count rather than a measured width, so an
 * unusually wide 19-character title can still wrap. Fixing that properly
 * means measuring the rendered title against the real content width and
 * demoting on overflow — a change to Screen rather than to a number, and
 * worth doing if this constant ever has to move again.
 */
const SHORT_TITLE_MAX = 19;

export const Screen: React.FC<ScreenProps> = ({
  title,
  banner,
  scroll = true,
  edges = ['top', 'left', 'right'],
  contentContainerStyle,
  style,
  testID,
  children,
}) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, -8], Extrapolation.CLAMP) },
    ],
  }));

  const compactHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, 1], Extrapolation.CLAMP),
  }));

  const body = (
    <>
      {title && (
        <AnimatedView style={[styles.largeTitle, largeTitleStyle]}>
          <Text variant={title.length <= SHORT_TITLE_MAX ? 'title' : 'heading'}>{title}</Text>
        </AnimatedView>
      )}
      {banner && <View style={styles.banner}>{banner}</View>}
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </>
  );

  return (
    <SafeAreaView edges={edges as Edge[]} style={[styles.screen, style]} testID={testID}>
      {title && (
        <AnimatedView pointerEvents="none" style={[styles.compactHeader, compactHeaderStyle]}>
          <Text variant="heading" numberOfLines={1}>
            {title}
          </Text>
        </AnimatedView>
      )}
      {scroll ? (
        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </AnimatedScrollView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
    </SafeAreaView>
  );
};
Screen.displayName = 'Screen';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing[8] },
  largeTitle: { paddingHorizontal: spacing[4], paddingTop: spacing[1], paddingBottom: spacing[2] },
  banner: { paddingHorizontal: spacing[4], marginBottom: spacing[3] },
  content: { paddingHorizontal: spacing[4], gap: spacing[4] },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: COMPACT_HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    zIndex: 10,
  },
});
