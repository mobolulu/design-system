import React, { useEffect } from 'react';
import { Modal as RNModal, StyleSheet, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { elevation, motion, radii, colors } from '../tokens';
import { useMotionDuration } from '../lib/useMotionDuration';
import { Text } from './Text';
import { AnimatedView, AnimatedPressable } from '../lib/animated';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  style?: object;
  testID?: string;
  children: React.ReactNode;
}

const decelerateEasing = Easing.bezier(
  motion.easing.decelerate[0],
  motion.easing.decelerate[1],
  motion.easing.decelerate[2],
  motion.easing.decelerate[3],
);
const accelerateEasing = Easing.bezier(
  motion.easing.accelerate[0],
  motion.easing.accelerate[1],
  motion.easing.accelerate[2],
  motion.easing.accelerate[3],
);

const SHEET_TRAVEL = 420;

/**
 * The native-feeling container for confirm/choose steps that used to be
 * full-screen pushes (MBLL-134). Slides up on `motion.duration.base` with a
 * decelerate curve; dismisses faster, on `motion.duration.fast`, with an
 * accelerate curve — opening should feel considered, closing should feel
 * immediate.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  footer,
  style,
  testID,
  children,
}) => {
  const progress = useSharedValue(0);
  const openDuration = useMotionDuration(motion.duration.base);
  const closeDuration = useMotionDuration(motion.duration.fast);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, {
      duration: open ? openDuration : closeDuration,
      easing: open ? decelerateEasing : accelerateEasing,
    });
  }, [open, progress, openDuration, closeDuration]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.4 }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * SHEET_TRAVEL }],
  }));

  return (
    <RNModal visible={open} transparent animationType="none" onRequestClose={onClose} testID={testID}>
      <View style={styles.container}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={[styles.backdrop, backdropStyle]}
          onPress={onClose}
        />
        <AnimatedView style={[styles.sheet, elevation.overlay, sheetStyle, style]}>
          <View style={styles.grabber} />
          {title && (
            <Text variant="heading" style={styles.title}>
              {title}
            </Text>
          )}
          {children}
          {footer && <View style={styles.footer}>{footer}</View>}
        </AnimatedView>
      </View>
    </RNModal>
  );
};
BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000' },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    backgroundColor: colors.brand.white,
    padding: 16,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.neutral[300],
    marginBottom: 12,
  },
  title: { marginBottom: 12 },
  footer: { marginTop: 16 },
});
