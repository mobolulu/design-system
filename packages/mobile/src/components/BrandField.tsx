import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { appBrand, type AppBrandName } from '../tokens';

export interface BrandFieldProps {
  /** Which app's field to draw. */
  brand?: AppBrandName;
  /** Rendered behind the gradient's children, full-bleed. */
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A full-bleed brand-coloured field (MBLL-331): the whole viewport is the
 * app's own colour, with content on it rather than on a card floating above
 * a grey page.
 *
 * `react-native-svg`, not `expo-linear-gradient`. SVG is already a
 * dependency of this package and of all three apps (Logo and Icon render
 * from it), so the gradient costs no new native module and no app rebuild
 * to pick up — and `expo-linear-gradient` is installed in none of the three.
 *
 * The solid `mid` sits on the wrapper underneath as well as in the
 * gradient. It is not redundant: if the SVG layer fails to draw for any
 * reason the field stays a dark brand colour, which is the condition every
 * contrast guarantee in `appBrand` is written against. A field that falls
 * back to transparent would put white text on white.
 */
export const BrandField: React.FC<BrandFieldProps> = ({
  brand = 'client',
  children,
  style,
  testID,
}) => {
  const field = appBrand[brand];
  // Unique per field so two BrandFields on one screen cannot collide on the
  // gradient id — SVG defs ids are document-global.
  const gradientId = `brandField-${brand}`;

  return (
    <View testID={testID} style={[styles.field, { backgroundColor: field.mid }, style]}>
      <Svg
        style={StyleSheet.absoluteFill}
        // Decorative: the field carries no information a screen reader needs,
        // and the text on top of it is already in the tree.
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={field.deep} />
            <Stop offset="1" stopColor={field.mid} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
};
BrandField.displayName = 'BrandField';

const styles = StyleSheet.create({
  field: { flex: 1 },
});
