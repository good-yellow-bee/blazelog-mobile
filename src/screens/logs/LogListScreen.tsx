import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { LogStackScreenProps } from '@/types/navigation';
import { LogFilter, LogList, toApiFilters } from '@/components/logs';
import type { LogFilterState } from '@/components/logs';
import { useLogsQuery, flattenLogs } from '@/hooks/useLogs';
import type { Log } from '@/api/types';

const getDefaultStart = (): string => {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date.toISOString();
};

export const LogListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<LogStackScreenProps<'LogList'>['navigation']>();

  const [filters, setFilters] = useState<LogFilterState>({
    start: getDefaultStart(),
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useLogsQuery(toApiFilters(filters));

  const logs = flattenLogs(data?.pages);

  const handleLogPress = useCallback(
    (log: Log) => {
      navigation.navigate('LogDetail', { logId: log.id, log });
    },
    [navigation]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFiltersChange = useCallback((newFilters: LogFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleStreamPress = useCallback(() => {
    navigation.navigate('LogStream');
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LogFilter filters={filters} onFiltersChange={handleFiltersChange} />
      <LogList
        logs={logs}
        onLogPress={handleLogPress}
        onEndReached={handleEndReached}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isRefreshing={isRefetching}
        hasNextPage={!!hasNextPage}
      />
      <FAB
        icon="play"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={handleStreamPress}
        label="Live"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
