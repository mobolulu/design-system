import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OtpSignIn } from '../components/OtpSignIn';
import type { OtpClient, OtpPost } from '../auth/createOtpClient';
import { createOtpClient } from '../auth/createOtpClient';
import type { OtpLoginResponse } from '../auth/types';

const session: OtpLoginResponse = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresInS: 900,
  user: { userId: 'usr_4821', role: 'CLIENT', displayName: 'Siti Aminah' },
};

function isDisabled(el: { props: { accessibilityState?: { disabled?: boolean } } }): boolean | undefined {
  return el.props.accessibilityState?.disabled;
}

function transportError(status: number, data: { code?: string; message?: string; details?: object }) {
  const e = new Error(data.message ?? `HTTP ${status}`) as Error & { status: number; data: typeof data };
  e.status = status;
  e.data = data;
  return e;
}

describe('OtpSignIn', () => {
  it('moves from identify to code entry once a code is sent', async () => {
    const post = jest.fn<Promise<unknown>, [string, unknown]>().mockResolvedValue({
      channel: 'TELEGRAM',
      expiresInS: 300,
      attemptsAllowed: 5,
    });
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('otp.identifier'), '+6281234567890');
    fireEvent.press(screen.getByTestId('otp.send-code'));

    await waitFor(() => expect(screen.getByTestId('otp.code')).toBeTruthy());
    expect(screen.getByText(/we sent a 6-digit code to \+6281234567890 via telegram/i)).toBeTruthy();
    expect(screen.getByText(/expires in 5 minutes/i)).toBeTruthy();
  });

  it('switches the identifier field between phone and email', () => {
    const post = jest.fn();
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={jest.fn()} />);

    expect(screen.getByPlaceholderText('+62 812 3456 7890')).toBeTruthy();
    fireEvent.press(screen.getByTestId('otp.channel.email'));
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('hands the opened session to the app on a successful verify', async () => {
    const post = jest
      .fn<Promise<unknown>, [string, unknown]>()
      .mockResolvedValueOnce({ channel: 'TELEGRAM', expiresInS: 300, attemptsAllowed: 5 })
      .mockResolvedValueOnce(session);
    const onAuthed = jest.fn();
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={onAuthed} />);

    fireEvent.changeText(screen.getByTestId('otp.identifier'), '+6281234567890');
    fireEvent.press(screen.getByTestId('otp.send-code'));
    await waitFor(() => expect(screen.getByTestId('otp.code')).toBeTruthy());

    fireEvent.changeText(screen.getByTestId('otp.code'), '418263');
    fireEvent.press(screen.getByTestId('otp.verify'));

    await waitFor(() => expect(onAuthed).toHaveBeenCalledWith(session));
  });

  it('shows attempts left when the code is wrong and keeps the step', async () => {
    const post = jest
      .fn<Promise<unknown>, [string, unknown]>()
      .mockResolvedValueOnce({ channel: 'TELEGRAM', expiresInS: 300, attemptsAllowed: 5 })
      .mockRejectedValueOnce(transportError(401, { code: 'INVALID_CODE', message: 'Code does not match', details: { attemptsLeft: 3 } }));
    const onAuthed = jest.fn();
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={onAuthed} />);

    fireEvent.changeText(screen.getByTestId('otp.identifier'), '+6281234567890');
    fireEvent.press(screen.getByTestId('otp.send-code'));
    await waitFor(() => expect(screen.getByTestId('otp.code')).toBeTruthy());
    fireEvent.changeText(screen.getByTestId('otp.code'), '000000');
    fireEvent.press(screen.getByTestId('otp.verify'));

    await waitFor(() => expect(screen.getByText(/code does not match 3 attempts left\./i)).toBeTruthy());
    expect(onAuthed).not.toHaveBeenCalled();
    expect(screen.getByTestId('otp.code')).toBeTruthy();
  });

  it('clears a dead code after expiry so it cannot be retyped', async () => {
    const post = jest
      .fn<Promise<unknown>, [string, unknown]>()
      .mockResolvedValueOnce({ channel: 'TELEGRAM', expiresInS: 300, attemptsAllowed: 5 })
      .mockRejectedValueOnce(transportError(410, { code: 'CODE_EXPIRED', message: 'The code expired' }));
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('otp.identifier'), '+6281234567890');
    fireEvent.press(screen.getByTestId('otp.send-code'));
    await waitFor(() => expect(screen.getByTestId('otp.code')).toBeTruthy());
    fireEvent.changeText(screen.getByTestId('otp.code'), '123456');
    fireEvent.press(screen.getByTestId('otp.verify'));

    await waitFor(() => expect(screen.getByText(/the code expired/i)).toBeTruthy());
    expect((screen.getByTestId('otp.code').props as { value?: string }).value).toBe('');
  });

  it('locks sending behind the rate-limit window', async () => {
    const post = jest
      .fn<Promise<unknown>, [string, unknown]>()
      .mockRejectedValueOnce(
        transportError(429, {
          code: 'RATE_LIMITED',
          message: '3 codes already sent to this account in the last 15 minutes',
          details: { retryAfterS: 90 },
        }),
      );
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('otp.identifier'), '+6281234567890');
    fireEvent.press(screen.getByTestId('otp.send-code'));

    await waitFor(() => expect(screen.getByText(/3 codes already sent/i)).toBeTruthy());
    const send = screen.getByTestId('otp.send-code');
    expect(isDisabled(send)).toBe(true);
    expect(screen.getByText(/try again in 1:30/i)).toBeTruthy();
  });

  it('refuses to send without an identifier', () => {
    const post = jest.fn();
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={jest.fn()} />);

    const send = screen.getByTestId('otp.send-code');
    expect(isDisabled(send)).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });

  it('lets the user go back and use a different identifier', async () => {
    const post = jest.fn<Promise<unknown>, [string, unknown]>().mockResolvedValue({
      channel: 'TELEGRAM',
      expiresInS: 300,
      attemptsAllowed: 5,
    });
    render(<OtpSignIn client={createOtpClient(post as unknown as OtpPost)} onAuthed={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('otp.identifier'), '+6281234567890');
    fireEvent.press(screen.getByTestId('otp.send-code'));
    await waitFor(() => expect(screen.getByTestId('otp.code')).toBeTruthy());

    fireEvent.press(screen.getByTestId('otp.change-identifier'));
    expect(screen.getByTestId('otp.identifier')).toBeTruthy();
  });

  it('accepts a ready-made client (no factory required)', async () => {
    const client: OtpClient = {
      requestOtp: jest.fn().mockResolvedValue({ channel: 'EMAIL', expiresInS: 300, attemptsAllowed: 5 }),
      verifyOtp: jest.fn().mockResolvedValue(session),
    };
    const onAuthed = jest.fn();
    render(<OtpSignIn client={client} onAuthed={onAuthed} />);

    fireEvent.press(screen.getByTestId('otp.channel.email'));
    fireEvent.changeText(screen.getByTestId('otp.identifier'), 'siti@example.com');
    fireEvent.press(screen.getByTestId('otp.send-code'));
    await waitFor(() => expect(screen.getByTestId('otp.code')).toBeTruthy());
    fireEvent.changeText(screen.getByTestId('otp.code'), '418263');
    fireEvent.press(screen.getByTestId('otp.verify'));

    await waitFor(() => expect(onAuthed).toHaveBeenCalledWith(session));
    expect(client.verifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'EMAIL', identifier: 'siti@example.com', code: '418263' }),
    );
  });
});
