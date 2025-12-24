import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, ListRenderItem, Pressable } from 'react-native';
import { Text, useTheme, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { SettingsStackScreenProps } from '@/types/navigation';
import { useUsersQuery, useCurrentUser } from '@/hooks/useUsers';
import { EmptyState } from '@/components/common';
import type { User, UserRole } from '@/api/types';

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: '#f8514930', text: '#f85149' },
  operator: { bg: '#58a6ff30', text: '#58a6ff' },
  viewer: { bg: '#8b949e30', text: '#8b949e' },
};

export const UserListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SettingsStackScreenProps<'UserList'>['navigation']>();
  const { data: users, isLoading, isRefetching, refetch } = useUsersQuery();
  const { data: currentUser } = useCurrentUser();

  const handleUserPress = useCallback(
    (user: User) => {
      if (user.id !== currentUser?.id) {
        navigation.navigate('UserDetail', { userId: user.id });
      }
    },
    [navigation, currentUser]
  );

  const renderItem: ListRenderItem<User> = useCallback(
    ({ item }) => {
      const isSelf = item.id === currentUser?.id;
      const roleStyle = roleColors[item.role];

      return (
        <Pressable
          onPress={() => handleUserPress(item)}
          disabled={isSelf}
          style={({ pressed }) => [
            styles.item,
            {
              backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
              opacity: isSelf ? 0.6 : 1,
            },
          ]}
        >
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {item.username}
                {isSelf && (
                  <Text style={{ color: theme.colors.onSurfaceVariant }}> (you)</Text>
                )}
              </Text>
              <Chip
                style={[styles.roleChip, { backgroundColor: roleStyle.bg }]}
                textStyle={{ color: roleStyle.text, fontSize: 10 }}
                compact
              >
                {item.role.toUpperCase()}
              </Chip>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.email}
            </Text>
          </View>
        </Pressable>
      );
    },
    [handleUserPress, currentUser, theme]
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

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
        data={users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={[
          styles.content,
          (!users || users.length === 0) && styles.emptyContent,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="account-group-outline"
            title="No users"
            description="No users found in the system"
          />
        }
      />
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
  item: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
  },
  itemContent: {
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleChip: {
    height: 24,
  },
});
