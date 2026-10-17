import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { cn } from '../lib/utils';

export interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  // MBLL-311: the IME behaviour props. React Native's TextInput defaults are
  // autoCapitalize="sentences" and autoCorrect={true}, and until these were on
  // the contract no call site could opt out — the gate scan's manual token
  // field had its leading `e` uppercased by the Android keyboard on every
  // single entry, and the token then failed to decode with a message blaming
  // the token.
  //
  // Left undefined here on purpose, so React Native's defaults still stand for
  // the fields that want them (a person's name, a street address). A call site
  // holding a machine-readable, case-sensitive value opts out explicitly.
  //
  // Typed off TextInputProps rather than hand-written: autoComplete in
  // particular is a long platform-specific union that would drift.
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: TextInputProps['autoCorrect'];
  autoComplete?: TextInputProps['autoComplete'];
  spellCheck?: TextInputProps['spellCheck'];
  style?: object;
  inputStyle?: object;
  inputClassName?: string;
  testID?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      value,
      onChangeText,
      placeholder,
      secureTextEntry,
      keyboardType = 'default',
      autoCapitalize,
      autoCorrect,
      autoComplete,
      spellCheck,
      style,
      inputStyle,
      inputClassName,
      testID,
    },
    ref,
  ) => (
    <View style={style}>
      {label && <Text className="text-[13px] font-medium text-foreground">{label}</Text>}
      <TextInput
        ref={ref}
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        className={cn(
          'rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground',
          error && 'border-destructive',
          inputClassName,
        )}
        style={inputStyle}
      />
      {error ? (
        <Text className="text-[11px] text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="text-[11px] text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  ),
);
Input.displayName = 'Input';
