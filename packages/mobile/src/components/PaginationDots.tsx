import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radii, spacing } from '../tokens';

const DOT_SIZE = 8;
// The active dot stretches rather than growing, so the row's height never
// changes between slides and the dots do not jump as the user swipes.
const ACTIVE_DOT_WIDTH = 24;

export interface PaginationDotsProps {
  /** How many positions there are. */
  count: number;
  /** Which position is current, zero-based. */
  index: number;
  /** Colour of the current dot. */
  activeColor: string;
  /** Colour of the rest. */
  inactiveColor: string;
  testID?: string;
}

/**
 * Dots, not a progress bar (MBLL-331): the user needs to know how many
 * slides remain, and a bar only shows how far along they are.
 *
 * The row is one accessibility element reading "Step 2 of 3" rather than
 * three unlabelled decorations, because a screen-reader user needs the
 * position as much as a sighted one and three separate "image" nodes
 * convey nothing. `accessible` on the row is what collapses the dots under
 * it — they carry no accessibility props of their own, so they stay
 * queryable by testID in tests that do not opt into hidden elements.
 */
export const PaginationDots: React.FC<PaginationDotsProps> = ({
  count,
  index,
  activeColor,
  inactiveColor,
  testID,
}) => (
  <View
    testID={testID}
    style={styles.row}
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel={`Step ${index + 1} of ${count}`}
    accessibilityValue={{ min: 1, max: count, now: index + 1 }}
  >
    {Array.from({ length: count }, (_, i) => {
      const active = i === index;
      return (
        <View
          key={i}
          testID={`${testID ?? 'onboarding.dots'}.${i}${active ? '.active' : ''}`}
          style={[
            styles.dot,
            active
              ? { width: ACTIVE_DOT_WIDTH, backgroundColor: activeColor }
              : { backgroundColor: inactiveColor },
          ]}
        />
      );
    })}
  </View>
);
PaginationDots.displayName = 'PaginationDots';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.full,
  },
});
