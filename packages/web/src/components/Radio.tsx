import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface RadioProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: string;
}

// A Radio is a Radix Item and only works inside a RadioGroup Root — export
// one so consumers don't have to reach for @radix-ui/react-radio-group.
export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ label, className, orientation = 'vertical', ...rest }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn('gap-2 text-sm', orientation === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col', className)}
      {...rest}
    />
  </div>
));
RadioGroup.displayName = 'RadioGroup';

export const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ label, className, id, ...rest }, ref) => {
  const inputId = id ?? rest.value;
  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer text-sm text-foreground">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={inputId}
        className={cn(
          'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...rest}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {label && <span>{label}</span>}
    </label>
  );
});
Radio.displayName = 'Radio';
