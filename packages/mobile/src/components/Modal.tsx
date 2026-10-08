import React from 'react';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import { cn } from '../lib/utils';
import { elevation } from '../tokens';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  style?: object;
  titleStyle?: object;
  className?: string;
  titleClassName?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, footer, style, titleStyle, className, titleClassName, children }) => (
  <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable
      className="flex-1 bg-black/40 px-4 justify-center"
      onPress={onClose}
    >
      <Pressable
        className={cn('rounded-lg bg-card p-4', className)}
        style={[elevation.overlay, style]}
        onPress={(e) => e.stopPropagation()}
      >
        {title && (
          <Text className={cn('mb-3 text-base font-semibold text-foreground', titleClassName)} style={titleStyle}>
            {title}
          </Text>
        )}
        <View>{children}</View>
        {footer && <View className="mt-4">{footer}</View>}
      </Pressable>
    </Pressable>
  </RNModal>
);
