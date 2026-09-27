import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Alert } from './Alert';
import { Button } from './Button';
import { Input } from './Input';
import { VStack } from './Stack';
import { cn } from '../lib/utils';
import type { OtpError } from '../auth/OtpError';
import type { OtpChannel, OtpLoginResponse } from '../auth/types';
import type { OtpClient } from '../auth/createOtpClient';

export interface OtpSignInProps {
  /** The flow client; see createOtpClient. */
  client: OtpClient;
  /** Called once with the opened session (tokens + user). */
  onAuthed: (session: OtpLoginResponse) => void;
  /** Channel preselected on the identify step. Default TELEGRAM. */
  defaultChannel?: OtpChannel;
  /** Names the device session the refresh token belongs to (spec §6). */
  deviceId?: string;
}

const CHANNELS: { key: OtpChannel; label: string }[] = [
  { key: 'TELEGRAM', label: 'Telegram' },
  { key: 'EMAIL', label: 'Email' },
];

// The one-time-code sign-in flow, implemented once and reused by every app
// (MBLL-38, architecture §6): identify → code → session. No passwords, no
// social OAuth. The app owns branding around it and what happens to the
// session (token storage, navigation). testIDs are stable so the Maestro
// flows can drive the same journey in all three apps.
export const OtpSignIn: React.FC<OtpSignInProps> = ({
  client,
  onAuthed,
  defaultChannel = 'TELEGRAM',
  deviceId,
}) => {
  const [step, setStep] = useState<'identify' | 'code'>('identify');
  const [channel, setChannel] = useState<OtpChannel>(defaultChannel);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<OtpError | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [sentTo, setSentTo] = useState<{ channel: OtpChannel; identifier: string; expiresInS: number } | null>(null);
  const [retryAfterS, setRetryAfterS] = useState(0);

  // Rate-limit countdown: ticks down while positive, stops at zero.
  useEffect(() => {
    if (retryAfterS <= 0) return;
    const timer = setInterval(() => setRetryAfterS((s) => (s > 0 ? s - 1 : s)), 1000);
    return () => clearInterval(timer);
  }, [retryAfterS > 0]);

  async function requestCode() {
    setError(null);
    setBusy(true);
    try {
      const res = await client.requestOtp(channel, identifier.trim());
      setSentTo({ channel, identifier: identifier.trim(), expiresInS: res.expiresInS });
      setStep('code');
      setCode('');
      setAttemptsLeft(null);
    } catch (e) {
      const err = e as OtpError;
      setError(err);
      if (err.code === 'RATE_LIMITED' && err.retryAfterS) setRetryAfterS(err.retryAfterS);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const session = await client.verifyOtp({
        channel,
        identifier: identifier.trim(),
        code: code.trim(),
        deviceId,
      });
      onAuthed(session);
    } catch (e) {
      const err = e as OtpError;
      setError(err);
      if (typeof err.attemptsLeft === 'number') setAttemptsLeft(err.attemptsLeft);
      // A dead code cannot be retyped into a win — clear it.
      if (err.code === 'CODE_EXPIRED' || err.code === 'ATTEMPTS_EXCEEDED') setCode('');
    } finally {
      setBusy(false);
    }
  }

  function errorText(): string | null {
    if (!error) return null;
    if (error.code === 'INVALID_CODE' && attemptsLeft !== null) {
      return `${error.message} ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`;
    }
    return error.message;
  }

  if (step === 'identify') {
    return (
      <VStack gap={4}>
        <View className="flex-row gap-2" accessibilityRole="radiogroup">
          {CHANNELS.map((c) => {
            const active = c.key === channel;
            return (
              <Pressable
                key={c.key}
                role="radio"
                accessibilityState={{ selected: active }}
                testID={`otp.channel.${c.key.toLowerCase()}`}
                onPress={() => setChannel(c.key)}
                className={cn(
                  'rounded-full px-4 py-2',
                  active ? 'bg-primary' : 'bg-muted border border-border',
                )}
              >
                <Text
                  className={cn('text-sm font-semibold', active ? 'text-primary-foreground' : 'text-foreground')}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          testID="otp.identifier"
          label={channel === 'TELEGRAM' ? 'Phone number' : 'Email'}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={channel === 'TELEGRAM' ? '+62 812 3456 7890' : 'you@example.com'}
          keyboardType={channel === 'TELEGRAM' ? 'phone-pad' : 'email-address'}
        />

        {error && <Alert tone="error">{errorText()}</Alert>}

        <Button
          size="xl"
          fullWidth
          testID="otp.send-code"
          loading={busy}
          disabled={!identifier.trim() || retryAfterS > 0}
          onPress={requestCode}
        >
          {retryAfterS > 0 ? `Try again in ${formatCountdown(retryAfterS)}` : 'Send code'}
        </Button>
      </VStack>
    );
  }

  return (
    <VStack gap={4}>
      <Text className="text-sm text-muted-foreground" testID="otp.sent-to">
        We sent a 6-digit code to {sentTo?.identifier} via{' '}
        {channel === 'TELEGRAM' ? 'Telegram' : 'email'}. It expires in{' '}
        {Math.ceil((sentTo?.expiresInS ?? 300) / 60)} minutes.
      </Text>

      <Input
        testID="otp.code"
        label="6-digit code"
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
        placeholder="418263"
        keyboardType="number-pad"
      />

      {error && <Alert tone="error">{errorText()}</Alert>}

      <Button
        size="xl"
        fullWidth
        testID="otp.verify"
        loading={busy}
        disabled={code.length !== 6}
        onPress={verify}
      >
        Verify
      </Button>

      <Button
        variant="ghost"
        testID="otp.resend"
        disabled={retryAfterS > 0 || busy}
        onPress={requestCode}
      >
        {retryAfterS > 0 ? `Resend available in ${formatCountdown(retryAfterS)}` : 'Resend code'}
      </Button>

      <Button variant="ghost" testID="otp.change-identifier" disabled={busy} onPress={() => setStep('identify')}>
        Use a different {channel === 'TELEGRAM' ? 'number' : 'email'}
      </Button>
    </VStack>
  );
};
OtpSignIn.displayName = 'OtpSignIn';

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}
