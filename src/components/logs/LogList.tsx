import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, ListRenderItem } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { LogEntry } from './LogEntry';
import { EmptyState } from '../common/EmptyState';
import type { Log } from '@/api/types';

interface LogListProps {
  logs: Log[];
  onLogPress: (log: Log) => void;
  onEndReached: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
}

const LOG_ENTRY_HEIGHT = 88;

export const LogList = ({
  logs,
  onLogPress,
  onEndReached,
  onRefresh,
  isLoading,
  isFetchingNextPage,
  isRefreshing,
  hasNextPage,
}: LogListProps) => {
  const theme = useTheme();

  const renderItem: ListRenderItem<Log> = useCallback(
    ({ item }) => <LogEntry log={item} onPress={onLogPress} />,
    [onLogPress]
  );

  const keyExtractor = useCallback((item: Log) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      onEndReached();
    }
  }, [hasNextPage, isFetchingNextPage, onEndReached]);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Log> | null | undefined, index: number) => ({
      length: LOG_ENTRY_HEIGHT,
      offset: LOG_ENTRY_HEIGHT * index,
      index,
    }),
    []
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="file-document-outline"
        title="No logs found"
        description="Try adjusting your filters or time range"
      />
    );
  };

  if (isLoading && logs.length === 0) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={logs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[styles.content, logs.length === 0 && styles.emptyContent]}
      style={{ backgroundColor: theme.colors.background }}
      removeClippedSubviews
      maxToRenderPerBatch={15}
      windowSize={7}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: 8,
  },
  emptyContent: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
