import React from 'react';
import { Text, TextInput, View } from 'react-native';
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
  style?: object;
  inputStyle?: object;
  inputClassName?: string;
  testID?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, hint, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', style, inputStyle, inputClassName, testID }, ref) => (
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
