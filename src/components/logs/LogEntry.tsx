import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LogLevelBadge } from './LogLevelBadge';
import type { Log } from '@/api/types';

interface LogEntryProps {
  log: Log;
  onPress: (log: Log) => void;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const LogEntry = ({ log, onPress }: LogEntryProps) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onPress(log)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <LogLevelBadge level={log.level} />
        <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
          {formatTimestamp(log.timestamp)}
        </Text>
      </View>
      <Text
        style={[styles.message, { color: theme.colors.onSurface }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {log.message}
      </Text>
      {log.source ? (
        <Text style={[styles.source, { color: theme.colors.onSurfaceVariant }]}>
          {log.source}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  source: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'monospace',
  },
});
