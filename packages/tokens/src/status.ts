// Semantic status mapping used by StatusPill / Badge across web + mobile.
// Keys mirror @mobolulu/shared enums (UserStatus, OrderStatus, etc.).

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Maps a backend status string to a visual tone. Unknown values -> neutral.
export const statusTone: Record<string, Tone> = {
  // UserStatus
  ACTIVE: 'success',
  VERIFIED: 'success',
  SUSPENDED: 'neutral',
  // OrderStatus
  PENDING: 'info',
  DISPATCHING: 'info',
  OFFERED: 'warning',
  ACCEPTED: 'info',
  PICKED_UP: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  EXPIRED: 'neutral',
  // OfferStatus
  DECLINED: 'error',
  TIMEOUT: 'neutral',
  // Wallet / Topup / Document / Notification statuses
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
