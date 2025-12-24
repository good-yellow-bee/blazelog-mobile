import React from 'react';
import { StyleSheet, ViewStyle, Pressable, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

export const Card = ({
  children,
  onPress,
  style,
  elevation = 1,
}: CardProps) => {
  const theme = useTheme();

  const content = (
    <Surface
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
      elevation={elevation}
    >
      {children}
    </Surface>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  pressable: {
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.8,
  },
});
