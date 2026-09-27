// One-time-code sign-in contract (architecture §6, docs/openapi/auth.yaml
// from MBLL-13). The types mirror the auth-service spec; once they graduate
// to @mobolulu/shared the re-export here can switch to that package without
// touching the components.

/** Where the six-digit code is delivered. */
export type OtpChannel = 'TELEGRAM' | 'EMAIL';

/** 202 body of POST /otp/request. */
export interface OtpRequestResult {
  channel: OtpChannel;
  expiresInS: number;
  attemptsAllowed: number;
}

/** The `user` object inside a LoginResponse. */
export interface OtpSessionUser {
  userId: string;
  role: string;
  displayName: string;
  adminRole?: string;
}

/** Registration progress surfaced at sign-in; empty steps when complete. */
export interface OtpRegistrationState {
  canPlaceOrder: boolean | null;
  canReceiveWork: boolean | null;
  stepsRemaining: string[];
}

/** 200 body of POST /otp/verify (and /refresh). */
export interface OtpLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInS: number;
  user: OtpSessionUser;
  registration?: OtpRegistrationState;
  warnings?: string[];
}
