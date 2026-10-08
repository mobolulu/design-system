// Local copy of @mobolulu/design-tokens.
// The mobile package is published to GHCR as a standalone artifact, but
// design-tokens is an internal (private, unpublished) workspace package.
// Inlining keeps the published package self-contained so consumers (and EAS
// builds) don't need access to the private tokens package.

// Brand palette extracted from the MOBOLULU logo/icon SVGs (assets/).
export const brand = {
  primary: '#15803D', // deep green (wordmark, bin lid)
  green: '#22C55E', // mid green (gradient body)
  light: '#4ADE80', // light green (bin handle, gradient top)
  dark: '#166534', // very dark green (tagline "GO GREEN")
  white: '#FFFFFF',
} as const;

export const status = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// Neutral gray scale for text, borders, backgrounds.
export const neutral = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
} as const;

// Maps backend UserStatus / UserRole to a display color.
export const userStatus = {
  ACTIVE: status.success,
  VERIFIED: status.success,
  SUSPENDED: neutral[400],
  CLIENT: brand.primary,
  COLLECTOR: brand.green,
  ADMIN: brand.dark,
} as const;

export const colors = {
  brand,
  status,
  neutral,
  userStatus,
} as const;

// 4px base spacing scale. 1 unit = 4px.
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontFamily = {
  web: "'Inter', 'Segoe UI', Arial, sans-serif",
  mobile: 'System',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
} as const;

// Native elevation tokens (v0.5, MBLL-134). The web `shadows` CSS strings in
// `packages/tokens` cannot be consumed by React Native's StyleSheet — passed
// into a `style` prop they are silently dropped, so every mobile surface sat
// flat. These are plain style objects: `shadowColor`/`shadowOffset`/
// `shadowOpacity`/`shadowRadius` for iOS, `elevation` for Android (which
// ignores the iOS shadow props entirely). Values are tuned to the same
// progression as the web tokens so the two platforms read as one brand.
export interface ElevationStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const elevation = {
  // No surface separation — the base background itself.
  flat: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Cards and other resting surfaces. Mirrors the web `card` shadow.
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  // Sheets and modals sitting above the page.
  overlay: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  // FABs and toasts — the highest resting surface. Mirrors the web `floating` shadow.
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  },
} as const satisfies Record<'flat' | 'raised' | 'overlay' | 'floating', ElevationStyle>;

export type ElevationLevel = keyof typeof elevation;

// Motion tokens (v0.5, MBLL-134). One place for duration/easing so nothing
// is hand-tuned per screen. Easing curves are cubic-bezier control points,
// consumable by `Easing.bezier(...)` from `react-native-reanimated` or RN's
// own `Easing` module.
export const motion = {
  duration: {
    instant: 0,
    fast: 150,
    base: 250,
    slow: 400,
  },
  easing: {
    standard: [0.4, 0, 0.2, 1],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
  },
  // A gentle, non-bouncy spring for press/sheet motion.
  spring: {
    damping: 18,
    mass: 1,
    stiffness: 180,
  },
} as const;

export type MotionDuration = keyof typeof motion.duration;
export type MotionEasing = keyof typeof motion.easing;

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Maps a backend status string to a visual tone. Unknown values -> neutral.
export const statusTone: Record<string, Tone> = {
  ACTIVE: 'success',
  VERIFIED: 'success',
  SUSPENDED: 'neutral',
  PENDING: 'info',
  DISPATCHING: 'info',
  OFFERED: 'warning',
  ACCEPTED: 'info',
  PICKED_UP: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  EXPIRED: 'neutral',
  DECLINED: 'error',
  TIMEOUT: 'neutral',
  SUCCESS: 'success',
  FAILED: 'error',
  SENT: 'info',
  DELIVERED: 'info',
  READ: 'neutral',
  PENDING_DOC: 'warning',
  REJECTED: 'error',
  ONLINE: 'success',
  OFFLINE: 'neutral',
};

export function toneForStatus(status: string): Tone {
  return statusTone[status] ?? 'neutral';
}

// Typography roles (v0.5, MBLL-134). `fontSize` is a raw scale; screens were
// hardcoding `fontSize`/`fontWeight` inline with no shared rhythm and no
// letter-spacing. These are complete, semantic text styles — tight negative
// tracking on the large sizes is most of what makes type read as designed
// rather than default. `numeric` is for every money and count readout so
// digits don't jitter as balances update (tabular figures).
export interface TextRole {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  lineHeight: number;
  letterSpacing: number;
  fontVariant?: ReadonlyArray<'tabular-nums'>;
}

export const textRoles: Record<
  'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'mono' | 'numeric',
  TextRole
> = {
  display: { fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.3 },
  heading: { fontSize: 20, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 18, letterSpacing: 0.1 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.2 },
  mono: { fontSize: 14, fontWeight: '500', lineHeight: 20, letterSpacing: 0 },
  numeric: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  },
};

export type TextRoleName = keyof typeof textRoles;
