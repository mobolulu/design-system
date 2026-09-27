// Error shape for the one-time-code flow: carries the machine-readable
// code from the auth-service Error schema plus the details that drive the
// UI (how long until a retry is allowed, how many attempts are left).

export type OtpErrorCode =
  | 'RATE_LIMITED' // 429 on /otp/request — too many codes sent
  | 'INVALID_CODE' // 401 on /otp/verify — wrong or consumed code
  | 'CODE_EXPIRED' // 410 on /otp/verify — request a new one
  | 'ATTEMPTS_EXCEEDED' // 429 on /otp/verify — the code is dead
  | 'REQUEST_FAILED'; // transport failure or unexpected shape

export class OtpError extends Error {
  readonly code: OtpErrorCode;
  readonly status?: number;
  /** Seconds until the next /otp/request may be sent (RATE_LIMITED). */
  readonly retryAfterS?: number;
  /** Failed verify attempts left before the code dies (INVALID_CODE). */
  readonly attemptsLeft?: number;

  constructor(
    message: string,
    code: OtpErrorCode,
    status?: number,
    retryAfterS?: number,
    attemptsLeft?: number,
  ) {
    super(message);
    this.name = 'OtpError';
    this.code = code;
    this.status = status;
    this.retryAfterS = retryAfterS;
    this.attemptsLeft = attemptsLeft;
  }
}
