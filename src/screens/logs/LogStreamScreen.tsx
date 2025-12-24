import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, FlatList, ListRenderItem } from 'react-native';
import { Text, useTheme, IconButton, Chip, Banner } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { LogStackScreenProps } from '@/types/navigation';
import { LogEntry } from '@/components/logs';
import { useSSE } from '@/hooks/useSSE';
import type { Log, LogLevel } from '@/api/types';

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warning', 'error', 'fatal'];

export const LogStreamScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<LogStackScreenProps<'LogStream'>['navigation']>();
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([]);
  const [displayLogs, setDisplayLogs] = useState<Log[]>([]);

  const {
    logs: streamLogs,
    isConnected,
    isConnecting,
    error,
    connect,
    clearLogs,
  } = useSSE({
    levels: selectedLevels,
    autoConnect: true,
  });

  // Update display logs when not paused
  useEffect(() => {
    if (!isPaused) {
      // Schedule update to avoid synchronous setState in render
      const id = requestAnimationFrame(() => setDisplayLogs(streamLogs));
      return () => cancelAnimationFrame(id);
    }
  }, [streamLogs, isPaused]);

  const handleLogPress = useCallback(
    (log: Log) => {
      navigation.navigate('LogDetail', { logId: log.id, log });
    },
    [navigation]
  );

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleLevelToggle = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    clearLogs();
  };

  const handleReconnect = () => {
    clearLogs();
    connect();
  };

  const renderItem: ListRenderItem<Log> = useCallback(
    ({ item }) => <LogEntry log={item} onPress={handleLogPress} />,
    [handleLogPress]
  );

  const keyExtractor = useCallback((item: Log) => item.id, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {isConnecting ? (
        <>
          <MaterialCommunityIcons
            name="connection"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Connecting to stream...
          </Text>
        </>
      ) : isConnected ? (
        <>
          <MaterialCommunityIcons name="antenna" size={48} color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Waiting for logs...
          </Text>
        </>
      ) : (
        <>
          <MaterialCommunityIcons name="wifi-off" size={48} color={theme.colors.error} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Not connected
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {error && (
        <Banner
          visible
          actions={[{ label: 'Reconnect', onPress: handleReconnect }]}
          icon={({ size }) => (
            <MaterialCommunityIcons name="alert" size={size} color={theme.colors.error} />
          )}
        >
          {error}
        </Banner>
      )}

      <View style={[styles.toolbar, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isConnected
                    ? '#2ea043'
                    : isConnecting
                      ? '#d29922'
                      : theme.colors.error,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
              {isConnected ? 'Live' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon={isPaused ? 'play' : 'pause'}
              iconColor={theme.colors.primary}
              size={24}
              onPress={handlePauseToggle}
              disabled={!isConnected}
            />
            <IconButton
              icon="delete-outline"
              iconColor={theme.colors.onSurfaceVariant}
              size={24}
              onPress={clearLogs}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          {LOG_LEVELS.map((level) => (
            <Chip
              key={level}
              selected={selectedLevels.includes(level)}
              onPress={() => handleLevelToggle(level)}
              style={styles.chip}
              compact
            >
              {level.toUpperCase()}
            </Chip>
          ))}
        </View>
      </View>

      {isPaused && (
        <View style={[styles.pausedBanner, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons
            name="pause-circle"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.pausedText, { color: theme.colors.onSurfaceVariant }]}>
            Stream paused - {streamLogs.length - displayLogs.length} new logs
          </Text>
        </View>
      )}

      <FlatList
        data={displayLogs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.content, displayLogs.length === 0 && styles.emptyContent]}
        inverted={false}
      />

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          {displayLogs.length} logs in buffer
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginRight: -8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  pausedText: {
    fontSize: 12,
  },
  content: {
    paddingVertical: 8,
  },
  emptyContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  footer: {
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  footerText: {
    fontSize: 12,
  },
});
