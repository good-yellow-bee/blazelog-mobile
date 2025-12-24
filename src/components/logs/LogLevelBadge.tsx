import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import type { LogLevel } from '@/api/types';

interface LogLevelBadgeProps {
  level: LogLevel;
  style?: ViewStyle;
}

const levelColors: Record<LogLevel, { bg: string; text: string }> = {
  debug: { bg: '#8b949e30', text: '#8b949e' },
  info: { bg: '#58a6ff30', text: '#58a6ff' },
  warning: { bg: '#d2992230', text: '#d29922' },
  error: { bg: '#f8514930', text: '#f85149' },
  fatal: { bg: '#a371f730', text: '#a371f7' },
};

export const LogLevelBadge = ({ level, style }: LogLevelBadgeProps) => {
  const colors = levelColors[level] || levelColors.info;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{level.toUpperCase()}</Text>
    </View>
  );
};

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
