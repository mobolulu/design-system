// The one-time-code flow logic, implemented once for every app (MBLL-38).
// The app supplies a `post` that performs the actual request and throws on
// non-2xx with the auth-service Error body attached; this module owns the
// paths, request bodies, and the mapping of documented failures onto
// OtpError. The app-side post typically wraps its own apiFetch:
//
//   const otpClient = createOtpClient((path, body) =>
//     apiFetch(`${AUTH_PREFIX}${path}`, { method: 'POST', body, auth: false }),
//   );
//
// Paths are relative to the auth base: /api/v1/auth through the edge, or the
// Prism mock root (Prism ignores the servers.url prefix — see MBLL-38).

import { OtpError } from './OtpError';
import type { OtpChannel, OtpLoginResponse, OtpRequestResult } from './types';

/** What the transport throws on a non-2xx: status plus the Error body. */
export interface OtpTransportError {
  status?: number;
  data?: {
    code?: string;
    message?: string;
    details?: { retryAfterS?: number; attemptsLeft?: number };
  };
}

/** Performs POST {authBase}{path} with a JSON body; rejects on non-2xx. */
export type OtpPost = (path: string, body: unknown) => Promise<unknown>;

export interface OtpClient {
  /** Sends a six-digit code to the Telegram bot or registered email. */
  requestOtp(channel: OtpChannel, identifier: string): Promise<OtpRequestResult>;
  /** Verifies the code and opens a session. */
  verifyOtp(input: {
    channel: OtpChannel;
    identifier: string;
    code: string;
    deviceId?: string;
  }): Promise<OtpLoginResponse>;
}

export function createOtpClient(post: OtpPost): OtpClient {
  return {
    requestOtp: async (channel, identifier) => {
      try {
        return (await post('/otp/request', { channel, identifier })) as OtpRequestResult;
      } catch (e) {
        throw toOtpError(e, 'request');
      }
    },
    verifyOtp: async ({ channel, identifier, code, deviceId }) => {
      const body = deviceId ? { channel, identifier, code, deviceId } : { channel, identifier, code };
      try {
        return (await post('/otp/verify', body)) as OtpLoginResponse;
      } catch (e) {
        throw toOtpError(e, 'verify');
      }
    },
  };
}

function toOtpError(e: unknown, phase: 'request' | 'verify'): OtpError {
  const err = e as OtpTransportError | null;
  const status = err?.status;
  const body = err?.data;
  const details = body?.details;
  switch (status) {
    case 429:
      // 429 means two different things: too many codes requested (on
      // /otp/request) or all verify attempts used (on /otp/verify).
      return phase === 'request'
        ? new OtpError(
            body?.message ?? 'Too many codes requested — try again shortly.',
            'RATE_LIMITED',
            status,
            details?.retryAfterS,
          )
        : new OtpError(
            body?.message ?? 'Too many failed attempts — request a new code.',
            'ATTEMPTS_EXCEEDED',
            status,
            details?.retryAfterS,
          );
    case 410:
      return new OtpError(body?.message ?? 'That code expired — request a new one.', 'CODE_EXPIRED', status);
    case 401:
      return new OtpError(
        body?.message ?? 'That code does not match.',
        'INVALID_CODE',
        status,
        undefined,
        details?.attemptsLeft,
      );
    default:
      return new OtpError(
        e instanceof Error && e.message ? e.message : 'Sign-in is unavailable right now — try again.',
        'REQUEST_FAILED',
        status,
      );
  }
}
