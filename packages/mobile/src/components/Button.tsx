import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { PressFeedback } from './PressFeedback';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
// 'xl' is the glove target (XCUT-NFR-007): 56dp tall with larger text,
// for the collector in the street and the gate operator (XCUT-NFR-008).
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

const buttonVariants = cva(
  // Press feedback is a real scale/opacity tween (PressFeedback), not the
  // instant `active:` class swap this used to be (MBLL-134).
  'flex-row items-center justify-center gap-2 rounded-md disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        ghost: 'bg-transparent',
        danger: 'bg-destructive',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        xl: 'min-h-14 h-14 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      primary: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-primary',
      danger: 'text-destructive-foreground',
    },
    size: {
      sm: 'text-[13px]',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: object;
  textStyle?: object;
  className?: string;
  textClassName?: string;
  testID?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> & { variants: typeof buttonVariants } = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  className,
  textClassName,
  testID,
  children,
}) => (
  <PressFeedback
    testID={testID}
    role="button"
    disabled={disabled || loading}
    onPress={onPress}
    className={cn(buttonVariants({ variant, size }), fullWidth && 'self-stretch w-full', className)}
    style={style}
  >
    {loading && <ActivityIndicator size="small" color={loadingColor[variant ?? 'primary']} />}
    <Text className={cn(buttonTextVariants({ variant, size }), textClassName)} style={textStyle}>
      {children}
    </Text>
  </PressFeedback>
);
Button.displayName = 'Button';
Button.variants = buttonVariants;

// ActivityIndicator needs a concrete color; CSS variables are not readable here.
const loadingColor: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#166534',
  ghost: '#15803D',
  danger: '#FFFFFF',
};

export { buttonVariants, buttonTextVariants };
