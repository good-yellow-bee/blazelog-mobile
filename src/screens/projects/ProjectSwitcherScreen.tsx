import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, ListRenderItem, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useProjectsQuery } from '@/hooks/useProjects';
import { useProjectStore } from '@/store';
import { EmptyState } from '@/components/common';
import type { Project } from '@/api/types';

export const ProjectSwitcherScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data: projects, isLoading } = useProjectsQuery();
  const { currentProjectId, setCurrentProject } = useProjectStore();

  const handleSelect = useCallback(
    (project: Project) => {
      setCurrentProject(project.id);
      navigation.goBack();
    },
    [setCurrentProject, navigation]
  );

  const renderItem: ListRenderItem<Project> = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.item,
          { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface },
        ]}
      >
        <View style={styles.itemContent}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {item.name}
          </Text>
          {item.description && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          )}
        </View>
        <RadioButton
          value={item.id}
          status={currentProjectId === item.id ? 'checked' : 'unchecked'}
          onPress={() => handleSelect(item)}
          color={theme.colors.primary}
        />
      </Pressable>
    ),
    [handleSelect, currentProjectId, theme]
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

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
        data={projects}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.content,
          (!projects || projects.length === 0) && styles.emptyContent,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="folder-outline"
            title="No projects"
            description="You don't have access to any projects"
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
});
