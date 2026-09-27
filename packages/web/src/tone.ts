// Local copy of the status->tone mapping from @mobolulu/design-tokens.
// Inlined so the published web package is self-contained (tokens is internal /
// not published). Keep in sync with packages/tokens/src/status.ts.

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

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
