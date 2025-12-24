import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { useTheme, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { AlertStackScreenProps } from '@/types/navigation';
import { AlertCard } from '@/components/alerts';
import { EmptyState } from '@/components/common';
import { useAlertsQuery, useToggleAlert } from '@/hooks/useAlerts';
import { useProjectStore } from '@/store';
import type { Alert } from '@/api/types';

export const AlertListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AlertStackScreenProps<'AlertList'>['navigation']>();
  const { currentProjectId } = useProjectStore();
  const toggleAlert = useToggleAlert();

  const {
    data: alerts,
    isLoading,
    isRefetching,
    refetch,
  } = useAlertsQuery(currentProjectId || undefined);

  const handleAlertPress = useCallback(
    (alert: Alert) => {
      navigation.navigate('AlertDetail', { alertId: alert.id });
    },
    [navigation]
  );

  const handleToggle = useCallback(
    (alert: Alert, enabled: boolean) => {
      toggleAlert.mutate({ alert, enabled });
    },
    [toggleAlert]
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('AlertForm', {});
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderItem: ListRenderItem<Alert> = useCallback(
    ({ item }) => <AlertCard alert={item} onPress={handleAlertPress} onToggle={handleToggle} />,
    [handleAlertPress, handleToggle]
  );

  const keyExtractor = useCallback((item: Alert) => item.id, []);

  const renderEmpty = () => {
    if (isLoading) return null;
    if (!currentProjectId) {
      return (
        <EmptyState
          icon="folder-outline"
          title="No project selected"
          description="Select a project to view alerts"
        />
      );
    }
    return (
      <EmptyState
        icon="bell-off-outline"
        title="No alerts"
        description="Create your first alert to get notified about important events"
        action={{
          label: 'Create Alert',
          onPress: handleCreatePress,
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={alerts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.content,
          (!alerts || alerts.length === 0) && styles.emptyContent,
        ]}
      />
      {currentProjectId && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={handleCreatePress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingVertical: 8,
  },
  emptyContent: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
