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
          <Text variant="display">{title}</Text>
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
