import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { LogLevel } from '@/api/types';
import type { BlazelogTheme } from '@/theme';

interface LogLevelBadgeProps {
  level: LogLevel;
  style?: ViewStyle;
}

export const LogLevelBadge = React.memo(({ level, style }: LogLevelBadgeProps) => {
  const theme = useTheme<BlazelogTheme>();
  const color = theme.custom.colors[level] ?? theme.custom.colors.info;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}30` }, style]}>
      <Text style={[styles.text, { color }]}>{level.toUpperCase()}</Text>
    </View>
  );
});

LogLevelBadge.displayName = 'LogLevelBadge';

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
