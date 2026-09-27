import { createOtpClient, type OtpPost } from '../auth/createOtpClient';
import { OtpError } from '../auth/OtpError';

class TransportError extends Error {
  constructor(
    public status: number,
    public data?: { code?: string; message?: string; details?: { retryAfterS?: number; attemptsLeft?: number } },
  ) {
    super(data?.message ?? `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

const post = jest.fn<Promise<unknown>, [string, unknown]>();

describe('createOtpClient', () => {
  beforeEach(() => post.mockReset());

  it('requests a code with the documented path and body', async () => {
    post.mockResolvedValue({ channel: 'TELEGRAM', expiresInS: 300, attemptsAllowed: 5 });
    const client = createOtpClient(post as unknown as OtpPost);

    const res = await client.requestOtp('TELEGRAM', '+6281234567890');

    expect(post).toHaveBeenCalledWith('/otp/request', {
      channel: 'TELEGRAM',
      identifier: '+6281234567890',
    });
    expect(res.expiresInS).toBe(300);
  });

  it('verifies without deviceId when none is given, and with it when it is', async () => {
    post.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresInS: 900, user: { userId: 'u', role: 'CLIENT', displayName: 'S' } });
    const client = createOtpClient(post as unknown as OtpPost);

    await client.verifyOtp({ channel: 'EMAIL', identifier: 'a@b.c', code: '418263' });
    expect(post).toHaveBeenCalledWith('/otp/verify', {
      channel: 'EMAIL',
      identifier: 'a@b.c',
      code: '418263',
    });

    await client.verifyOtp({ channel: 'EMAIL', identifier: 'a@b.c', code: '418263', deviceId: 'dev-1' });
    expect(post).toHaveBeenLastCalledWith('/otp/verify', {
      channel: 'EMAIL',
      identifier: 'a@b.c',
      code: '418263',
      deviceId: 'dev-1',
    });
  });

  it('maps a 429 on request to RATE_LIMITED with the retry window', async () => {
    post.mockRejectedValue(
      new TransportError(429, {
        code: 'RATE_LIMITED',
        message: '3 codes already sent to this account in the last 15 minutes',
        details: { retryAfterS: 431 },
      }),
    );
    const client = createOtpClient(post as unknown as OtpPost);

    await expect(client.requestOtp('TELEGRAM', '+62')).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      retryAfterS: 431,
      status: 429,
    });
  });

  it('maps a 401 on verify to INVALID_CODE with attempts left', async () => {
    post.mockRejectedValue(
      new TransportError(401, {
        code: 'INVALID_CODE',
        message: 'Code does not match',
        details: { attemptsLeft: 3 },
      }),
    );
    const client = createOtpClient(post as unknown as OtpPost);

    await expect(client.verifyOtp({ channel: 'TELEGRAM', identifier: '+62', code: '000000' })).rejects.toMatchObject({
      code: 'INVALID_CODE',
      attemptsLeft: 3,
    });
  });

  it('maps a 410 on verify to CODE_EXPIRED', async () => {
    post.mockRejectedValue(new TransportError(410, { code: 'CODE_EXPIRED', message: 'The code expired' }));
    const client = createOtpClient(post as unknown as OtpPost);

    await expect(client.verifyOtp({ channel: 'TELEGRAM', identifier: '+62', code: '000000' })).rejects.toMatchObject({
      code: 'CODE_EXPIRED',
    });
  });

  it('maps a 429 on verify to ATTEMPTS_EXCEEDED, not RATE_LIMITED', async () => {
    post.mockRejectedValue(new TransportError(429, { code: 'ATTEMPTS_EXCEEDED', message: '5 failed attempts' }));
    const client = createOtpClient(post as unknown as OtpPost);

    await expect(client.verifyOtp({ channel: 'TELEGRAM', identifier: '+62', code: '000000' })).rejects.toMatchObject({
      code: 'ATTEMPTS_EXCEEDED',
    });
  });

  it('wraps an unexpected failure as REQUEST_FAILED with the transport message', async () => {
    post.mockRejectedValue(new Error('network down'));
    const client = createOtpClient(post as unknown as OtpPost);

    try {
      await client.requestOtp('TELEGRAM', '+62');
      fail('expected a rejection');
    } catch (e) {
      expect(e).toBeInstanceOf(OtpError);
      expect((e as OtpError).code).toBe('REQUEST_FAILED');
      expect((e as OtpError).message).toBe('network down');
    }
  });
});
