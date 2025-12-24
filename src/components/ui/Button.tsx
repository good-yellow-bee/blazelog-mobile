import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
  fullWidth = false,
}: ButtonProps) => {
  const theme = useTheme();

  const getMode = (): 'contained' | 'outlined' | 'text' => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'text';
      case 'outline':
        return 'outlined';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    if (variant === 'primary') {
      return theme.colors.primary;
    }
    return undefined;
  };

  return (
    <PaperButton
      mode={getMode()}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={getButtonColor()}
      textColor={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary}
      style={[styles.button, fullWidth && styles.fullWidth, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
});
