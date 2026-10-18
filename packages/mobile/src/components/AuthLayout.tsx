import React from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appBrand, colors, motion, radii, spacing, type AppBrandName } from '../tokens';
import { BrandField } from './BrandField';
import { Logo } from './Logo';
import { Text } from './Text';
import { useEntryAnimation } from '../lib/useEntryAnimation';

/** Default mark size. 56 was a favicon (MBLL-331); this is the anchor. */
const MARK_SIZE = 132;

export interface AuthLayoutProps {
  /** Which app's field to draw behind the composition. */
  brand?: AppBrandName;
  /** The display line — the brand, not a sentence. Set at `display`, 34/800. */
  wordmark: string;
  /** The supporting line — what this app is for. Set at `heading`, 20/700. */
  tagline: string;
  /** The quiet third line. Set at `label`, 14/600, in the app's tint. */
  supporting?: string;
  /** Mark size override in dp. */
  markSize?: number;
  /** The sign-in form. Rendered in the panel, on a light surface. */
  children: React.ReactNode;
  testID?: string;
}

/**
 * The signed-out composition for all three apps (MBLL-331).
 *
 * Two bands, and the split is the whole design:
 *
 * - The **hero** is full-bleed brand colour and takes whatever height is
 *   left. The mark is the anchor at `MARK_SIZE`, and three type sizes sit
 *   under it — display, heading, label — because hierarchy is what reads as
 *   designed. It shrinks when the keyboard opens rather than pushing the
 *   form off the bottom of the screen.
 * - The **panel** is a light sheet anchored to the bottom edge, full-width,
 *   rounded on the top corners only. It is not a floating card: it has no
 *   outer margin and no bottom corners, so the composition is one surface
 *   meeting another rather than a small rectangle adrift in a grey field.
 *
 * The panel being light is load-bearing, not a style choice. `OtpSignIn` is
 * shared and tested and this issue may not change its behaviour, so its
 * light-surface classes (`bg-primary`, `text-foreground`, `bg-muted`) have
 * to keep landing on a light surface — the form is re-composed around,
 * exactly as asked, and stays legible while the rest of the screen goes
 * dark.
 *
 * Entry motion plays once: hero, then panel, staggered. See
 * `useEntryAnimation` for why it is RN `Animated` and not Reanimated.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  brand = 'client',
  wordmark,
  tagline,
  supporting,
  markSize = MARK_SIZE,
  children,
  testID = 'auth',
}) => {
  const field = appBrand[brand];
  const heroEntry = useEntryAnimation({ distance: 16 });
  const panelEntry = useEntryAnimation({ delay: motion.duration.fast, distance: 24 });

  return (
    <BrandField brand={brand} testID={`${testID}.field`}>
      <KeyboardAvoidingView
        style={styles.fill}
        // iOS does not resize the window for the keyboard, so the view has
        // to give up the height itself. Android's adjustResize already
        // shrinks it, and adding 'height' here on top double-counts.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.heroSafe}>
          <Animated.View style={[styles.hero, heroEntry]} testID={`${testID}.hero`}>
            {/*
              `app={brand}` is not optional here (MBLL-330). The mark is the
              mascot, and it has one livery per app — the same recolouring
              MBLL-230 gave the launcher icons. Left to its default this hero
              draws the client's green mascot on the collector's amber field
              and the gate's indigo one, which is the exact mismatch the
              owner caught on a handset.
            */}
            <Logo variant="icon" size={markSize} title={wordmark} app={brand} />
            <View style={styles.heroText}>
              <Text variant="display" color="#FFFFFF" style={styles.centered}>
                {wordmark}
              </Text>
              <Text variant="heading" color="#FFFFFF" style={styles.centered}>
                {tagline}
              </Text>
              {supporting && (
                <Text variant="label" color={field.tint} style={styles.centered}>
                  {supporting}
                </Text>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>

        <Animated.View style={[styles.panel, panelEntry]} testID={`${testID}.panel`}>
          {/*
            The form scrolls inside the panel. On a 320dp-wide, short device
            the OTP code step is tall enough to overflow the panel once the
            keyboard is up, and a sign-in button you cannot reach is a dead
            app. `keyboardShouldPersistTaps` keeps the first tap on the
            submit button working instead of being eaten dismissing the
            keyboard.
          */}
          <ScrollView
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </BrandField>
  );
};
AuthLayout.displayName = 'AuthLayout';

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // minHeight 0 lets the hero actually shrink inside the flex column; a
  // flex child's default minHeight is its content on some RN versions, and
  // without this the panel is what gets pushed out when the keyboard opens.
  heroSafe: { flex: 1, minHeight: 0 },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[6],
  },
  heroText: { alignItems: 'center', gap: spacing[2] },
  centered: { textAlign: 'center' },
  panel: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  panelContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
  },
});
