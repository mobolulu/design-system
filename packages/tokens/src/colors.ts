// Brand palette extracted from the MOBOLULU logo/icon SVGs (assets/).
// Single source of truth — web + mobile both import from here.

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
// Mirrors @mobolulu/shared enums: ACTIVE, SUSPENDED, VERIFIED (UserStatus);
// CLIENT, COLLECTOR, ADMIN (UserRole).
export const userStatus = {
  ACTIVE: status.success,
  VERIFIED: status.success,
  SUSPENDED: neutral[400],
  // role accents
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

export type BrandColor = keyof typeof brand;
export type StatusColor = keyof typeof status;
export type NeutralColor = keyof typeof neutral;
export type UserStatusColor = keyof typeof userStatus;
