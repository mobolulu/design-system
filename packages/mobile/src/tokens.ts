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

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.08)',
  cardHover: '0 4px 12px rgba(0,0,0,0.10)',
  floating: '0 10px 30px rgba(0,0,0,0.18)',
} as const;

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
