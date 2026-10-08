import './lib/nativewind-env';

export * from './theme';
export * from './money';
export * from './auth/types';
export { OtpError, type OtpErrorCode } from './auth/OtpError';
export { createOtpClient, type OtpClient, type OtpPost, type OtpTransportError } from './auth/createOtpClient';
export * from './components/Button';
export * from './components/Card';
export * from './components/Badge';
export * from './components/Tag';
export * from './components/StatusPill';
export * from './components/Input';
export * from './components/Switch';
export * from './components/Avatar';
export * from './components/Spinner';
export * from './components/Stack';
export * from './components/Alert';
export * from './components/Modal';
export * from './components/Logo';
export * from './components/OfflineBanner';
export * from './components/PendingSyncBadge';
export * from './components/OtpSignIn';
export * from './components/PressFeedback';
export * from './components/Text';
export * from './components/Screen';
export * from './components/Skeleton';
export * from './components/EmptyState';
export * from './components/Money';
export * from './components/BottomSheet';
export * from './components/ListRow';
export { cn } from './lib/utils';
export { useMotionDuration } from './lib/useMotionDuration';
// `haptics` is NOT re-exported here (MBLL-134): it's the only thing in this
// package that imports `expo-haptics`, which none of the three apps
// currently install. Bundling it into the main entry would make Metro
// resolve `expo-haptics` for every consumer, even ones that never call it,
// breaking the "three apps keep compiling unchanged" gate. Opt in via the
// `@mobolulu/design-system-mobile/haptics` subpath once a screen actually
// needs it — see package.json `exports`.
export { moboluluPreset } from './tailwind-preset';
export { default as moboluluPresetDefault } from './tailwind-preset';
