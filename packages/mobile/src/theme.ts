import { colors, spacing, radii, elevation, motion, textRoles, typography, type Tone } from './tokens';

// React Native theme object derived from the shared brand tokens.
// Consumed by the Expo client + collector apps.
export const theme = {
  colors: {
    brand: colors.brand,
    status: colors.status,
    neutral: colors.neutral,
    userStatus: colors.userStatus,
  },
  spacing,
  radii,
  elevation,
  motion,
  textRoles,
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
} as const;

// Tone -> concrete RN color (used by StatusPill, Badge, Alert).
export const toneColor: Record<Tone, string> = {
  success: colors.status.success,
  warning: colors.status.warning,
  error: colors.status.error,
  info: colors.status.info,
  neutral: colors.neutral[500],
};

export type Theme = typeof theme;
