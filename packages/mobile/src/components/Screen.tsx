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
 * MBLL-186 rendered "Withdrawal destination" and it wrapped onto two lines,
 * eating ~80dp before any content. The title was `display` — 34/800, which
 * is sized for digits, and digits do not wrap. At 360dp wide minus the
 * 2x16dp gutter there is ~328dp of line; a 22-character string wants ~425dp
 * at 34/800 and ~350dp at 28/800, so dropping one step would not have
 * fixed it. At 20/700 it wants ~250dp and fits with room.
 *
 * So the role, not the number, is the rule — see `textRoles` in tokens:
 * `display` is for a single numeric hero, never a sentence. A screen title
 * is `title` when it is short enough to stay on one line and `heading`
 * otherwise, which is most of them.
 *
 * 14 is approximate on purpose (0.57em average advance at weight 800); it
 * is a guard against wrapping, not a typographic constant.
 */
const SHORT_TITLE_MAX = 14;

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
