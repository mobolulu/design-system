import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appBrand, radii, spacing, type AppBrandName } from '../tokens';
import { BrandField } from './BrandField';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { PaginationDots } from './PaginationDots';
import { Text } from './Text';

export interface OnboardingSlide {
  /** Stable key; also the testID suffix for the slide. */
  key: string;
  /** Optional glyph above the headline. */
  icon?: IconName;
  /** The headline. Short — it is set at the `title` role. */
  title: string;
  /** One or two sentences answering a question the user actually has. */
  body: string;
}

export interface OnboardingProps {
  slides: readonly OnboardingSlide[];
  /**
   * Called once the user is through — by reaching the end, or by skipping.
   * The caller persists the "seen" flag and shows sign-in; this component
   * owns no storage, so it stays testable and the key stays the app's.
   */
  onDone: () => void;
  brand?: AppBrandName;
  /** Label on the last slide's primary action. Defaults to 'Get started'. */
  finishLabel?: string;
  testID?: string;
}

/**
 * The slides shown once, before sign-in (MBLL-331).
 *
 * Everything here is props. No fetch, no remote config: these are the app's
 * own words about itself, and the first launch is routinely the launch with
 * no network — a trainee on a handset in a room with bad signal has to get
 * through this to reach sign-in.
 *
 * Skip is rendered outside the pager, so it is on screen on every slide
 * including the last, and is one tap to sign-in from anywhere. That is the
 * returning-user path and the impatient-user path, and it is the one
 * control that must never be a slide away.
 */
export const Onboarding: React.FC<OnboardingProps> = ({
  slides,
  onDone,
  brand = 'client',
  finishLabel = 'Get started',
  testID = 'onboarding',
}) => {
  const field = appBrand[brand];
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const lastIndex = slides.length - 1;
  const onLast = index >= lastIndex;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, lastIndex));
      // Set state as well as scrolling: `scrollToOffset` is animated, so
      // onMomentumScrollEnd lands a frame or two later, and the dots and
      // the button label should change with the tap, not after it.
      setIndex(clamped);
      listRef.current?.scrollToOffset({ offset: clamped * width, animated: true });
    },
    [lastIndex, width],
  );

  // Android back: step back through the slides rather than dropping out of
  // the app. On the first slide it falls through to the default, which is
  // what a user pressing back on the very first screen means.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index === 0) return false;
      goTo(index - 1);
      return true;
    });
    return () => subscription.remove();
  }, [index, goTo]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Guard the divide: width is 0 in the frame before first layout on
      // some devices, and `0/0` would set the index to NaN.
      if (width <= 0) return;
      const settled = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex(Math.max(0, Math.min(settled, lastIndex)));
    },
    [width, lastIndex],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
      <View style={[styles.slide, { width }]} testID={`${testID}.slide.${item.key}`}>
        {item.icon && (
          <View style={[styles.iconWell, { borderColor: field.accent }]}>
            <Icon name={item.icon} size={36} color={field.accent} strokeWidth={1.5} />
          </View>
        )}
        <Text variant="title" color="#FFFFFF" style={styles.slideTitle}>
          {item.title}
        </Text>
        <Text variant="body" color={field.tint} style={styles.slideBody}>
          {item.body}
        </Text>
      </View>
    ),
    [width, field.accent, field.tint, testID],
  );

  return (
    <BrandField brand={brand} testID={`${testID}.field`}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe}>
        <View style={styles.skipRow}>
          <Pressable
            testID={`${testID}.skip`}
            role="button"
            accessibilityLabel="Skip onboarding and sign in"
            // 44x44 is the minimum real target; the label is smaller than
            // that, so the padding here is the target, not decoration.
            hitSlop={8}
            style={styles.skip}
            onPress={onDone}
          >
            <Text variant="label" color="#FFFFFF">
              Skip
            </Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          testID={`${testID}.pager`}
          data={slides as OnboardingSlide[]}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          // Three cheap slides: render them all and never measure. Both
          // props keep the pager smooth on the mid-range device this
          // targets — getItemLayout skips the async measure pass that
          // makes `scrollToOffset` land late on a cold start.
          getItemLayout={(_data, i) => ({ length: width, offset: width * i, index: i })}
          initialNumToRender={slides.length}
          style={styles.pager}
        />

        <View style={styles.footer}>
          <PaginationDots
            testID={`${testID}.dots`}
            count={slides.length}
            index={index}
            activeColor={field.accent}
            inactiveColor="rgba(255,255,255,0.35)"
          />
          <Button
            size="xl"
            fullWidth
            variant="secondary"
            testID={`${testID}.next`}
            onPress={onLast ? onDone : () => goTo(index + 1)}
          >
            {onLast ? finishLabel : 'Next'}
          </Button>
        </View>
      </SafeAreaView>
    </BrandField>
  );
};
Onboarding.displayName = 'Onboarding';

const styles = StyleSheet.create({
  safe: { flex: 1 },
  skipRow: { alignItems: 'flex-end', paddingHorizontal: spacing[2], paddingTop: spacing[1] },
  skip: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[3] },
  pager: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  iconWell: {
    width: 76,
    height: 76,
    borderRadius: radii.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  slideTitle: { textAlign: 'center' },
  slideBody: { textAlign: 'center' },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[4], gap: spacing[6] },
});
