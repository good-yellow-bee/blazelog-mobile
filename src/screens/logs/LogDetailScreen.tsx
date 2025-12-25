import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, Divider, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useRoute } from '@react-navigation/native';
import type { LogStackScreenProps } from '@/types/navigation';
import { LogLevelBadge } from '@/components/logs';
import { LoadingScreen } from '@/components/common';
import { useLogQuery } from '@/hooks/useLogs';

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  });
};

export const LogDetailScreen = () => {
  const theme = useTheme();
  const route = useRoute<LogStackScreenProps<'LogDetail'>['route']>();
  const { logId, log: passedLog } = route.params;
  const [metadataExpanded, setMetadataExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use passed log if available, otherwise fetch
  const { data: fetchedLog, isLoading } = useLogQuery(logId, !passedLog);
  const log = passedLog || fetchedLog;

  // Memoize JSON stringification to avoid recalculation on every render
  // Must be called before any early returns to follow React hooks rules
  const formattedMetadata = useMemo(() => {
    if (!log?.fields) return '';
    try {
      return JSON.stringify(log.fields, null, 2);
    } catch {
      return 'Unable to display metadata';
    }
  }, [log]);

  const handleCopyId = async () => {
    if (log) {
      await Clipboard.setStringAsync(log.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !log) {
    return <LoadingScreen message="Loading log details..." />;
  }

  if (!log) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>Log not found</Text>
      </View>
    );
  }

  const hasMetadata = log.fields && Object.keys(log.fields).length > 0;
  const hasLabels = log.labels && Object.keys(log.labels).length > 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <LogLevelBadge level={log.level} style={styles.badge} />
        <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
          {formatTimestamp(log.timestamp)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>Message</Text>
        <Text style={[styles.message, { color: theme.colors.onSurface }]}>{log.message}</Text>
      </View>

      <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

      <View style={styles.section}>
        <View style={styles.idRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Log ID
          </Text>
          <IconButton
            icon={copied ? 'check' : 'content-copy'}
            size={16}
            onPress={handleCopyId}
            iconColor={copied ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        </View>
        <Text style={[styles.mono, { color: theme.colors.onSurface }]}>{log.id}</Text>
      </View>

      {log.source && (
        <>
          <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              Source
            </Text>
            <Text style={[styles.mono, { color: theme.colors.onSurface }]}>{log.source}</Text>
          </View>
        </>
      )}

      {log.file_path && (
        <>
          <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              File Location
            </Text>
            <Text style={[styles.mono, { color: theme.colors.onSurface }]}>
              {log.file_path}
              {log.line_number && `:${log.line_number}`}
            </Text>
          </View>
        </>
      )}

      {log.http_method && (
        <>
          <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              HTTP Request
            </Text>
            <Text style={[styles.mono, { color: theme.colors.onSurface }]}>
              {log.http_method} {log.uri} {log.http_status && `→ ${log.http_status}`}
            </Text>
          </View>
        </>
      )}

      {hasLabels && (
        <>
          <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              Labels
            </Text>
            <View style={styles.labels}>
              {Object.entries(log.labels!).map(([key, value]) => (
                <View
                  key={key}
                  style={[styles.label, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <Text style={[styles.labelKey, { color: theme.colors.onSurfaceVariant }]}>
                    {key}:
                  </Text>
                  <Text style={[styles.labelValue, { color: theme.colors.onSurface }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {hasMetadata && (
        <>
          <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          <Pressable onPress={() => setMetadataExpanded(!metadataExpanded)} style={styles.section}>
            <View style={styles.expandHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
                Metadata
              </Text>
              <IconButton
                icon={metadataExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
              />
            </View>
            {metadataExpanded && (
              <Text style={[styles.json, { color: theme.colors.onSurface }]}>
                {formattedMetadata}
              </Text>
            )}
          </Pressable>
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  badge: {
    marginRight: 8,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -8,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  label: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelKey: {
    fontSize: 12,
    marginRight: 4,
  },
  labelValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  json: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 32,
  },
});
