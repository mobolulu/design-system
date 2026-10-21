import React from 'react';
import { View } from 'react-native';
import { cn } from '../lib/utils';
import { spacing } from '../tokens';

export interface StackProps {
  direction?: 'row' | 'column';
  gap?: keyof typeof spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  style?: object;
  className?: string;
  children: React.ReactNode;
}

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const;

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
} as const;

// MBLL-219: `fullWidth` resolves to `self-stretch w-full` — 100% of the row,
// *each* — so a row of them puts the first child across the whole row and
// every sibling after it off the screen edge. It renders fine in a unit test,
// which has no screen edge, so nothing caught it four times across two apps.
// A row Stack is the one place that can see the combination, so it says so.
function rowFullWidthOffenders(children: React.ReactNode): string[] {
  const offenders: string[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { fullWidth?: boolean };
    if (props?.fullWidth !== true) return;
    const type = child.type as { displayName?: string; name?: string } | string;
    offenders.push(typeof type === 'string' ? type : type?.displayName ?? type?.name ?? 'child');
  });
  return offenders;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  style,
  className,
  children,
}) => {
  // Warn at most once per mounted Stack per offending shape — a re-render of
  // the same row should not spam the dev console, but a row that newly
  // acquires a fullWidth child should still be heard.
  const warnedFor = React.useRef<string | null>(null);
  if (__DEV__ && direction === 'row') {
    const offenders = rowFullWidthOffenders(children);
    const key = offenders.join(',');
    if (offenders.length > 0 && key !== warnedFor.current) {
      warnedFor.current = key;
      console.warn(
        `[design-system] <Stack direction="row"> has ${offenders.length} child(ren) with ` +
          `fullWidth (${key}). fullWidth is column-only: in a row each one claims the ` +
          `full width and pushes its siblings off the screen edge. Use \`grow\` instead.`,
      );
    }
  }

  return (
    <View
      className={cn('flex', direction === 'row' ? 'flex-row' : 'flex-col', className)}
      style={[
        {
          gap: spacing[gap],
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Explicit annotations: with jsxImportSource "nativewind" the JSX result
// type references the runtime's react types, which TypeScript cannot
// name portably across the package boundary (TS2742).
export const VStack: React.FC<StackProps> = (props) => (
  <Stack {...props} direction="column" />
);
export const HStack: React.FC<StackProps> = (props) => <Stack {...props} direction="row" />;
