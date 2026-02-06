import React, { useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { Text, useTheme, Switch, Divider, List, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import type { SettingsStackScreenProps } from '@/types/navigation';
import { useAuthStore, useProjectStore, useSettingsStore } from '@/store';
import { useProjectQuery } from '@/hooks/useProjects';
import { useCurrentUser } from '@/hooks/useUsers';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS = [
  { value: 'light' as ThemeMode, label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark' as ThemeMode, label: 'Dark', icon: 'moon-waning-crescent' },
  { value: 'system' as ThemeMode, label: 'System', icon: 'cellphone' },
];

export const SettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<SettingsStackScreenProps<'Settings'>['navigation']>();
  const { logout } = useAuthStore();
  const { currentProjectId } = useProjectStore();
  const {
    theme: themeMode,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettingsStore();
  const { data: currentUser } = useCurrentUser();
  const { data: currentProject } = useProjectQuery(currentProjectId || '', !!currentProjectId);

  const isAdmin = currentUser?.role === 'admin';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }, [logout]);

  const handleThemeChange = useCallback(
    (value: string) => {
      setTheme(value as ThemeMode);
    },
    [setTheme]
  );

  const handleNotificationsToggle = useCallback(() => {
    setNotificationsEnabled(!notificationsEnabled);
  }, [notificationsEnabled, setNotificationsEnabled]);

  const handleProjectPress = useCallback(() => {
    navigation.navigate('ProjectSwitcher');
  }, [navigation]);

  const handleChangePasswordPress = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);

  const handleUserManagementPress = useCallback(() => {
    navigation.navigate('UserList');
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Preferences
          </Text>
          <View style={[styles.themeItem, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.themeHeader}>
              <List.Icon icon="brightness-6" />
              <Text style={[styles.themeLabel, { color: theme.colors.onSurface }]}>Appearance</Text>
            </View>
            <SegmentedButtons
              value={themeMode}
              onValueChange={handleThemeChange}
              buttons={THEME_OPTIONS}
              style={styles.segmentedButtons}
            />
          </View>
          <List.Item
            title="Push Notifications"
            description="Receive alert notifications"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                color={theme.colors.primary}
              />
            )}
            style={[styles.item, { backgroundColor: theme.colors.surface }]}
          />
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Project
          </Text>
          <Pressable onPress={handleProjectPress}>
            <List.Item
              title="Current Project"
              description={currentProject?.name || 'No project selected'}
              left={(props) => <List.Icon {...props} icon="folder-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={[styles.item, { backgroundColor: theme.colors.surface }]}
            />
          </Pressable>
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Account
          </Text>
          {currentUser && (
            <List.Item
              title={currentUser.username}
              description={currentUser.email}
              left={(props) => <List.Icon {...props} icon="account-outline" />}
              style={[styles.item, { backgroundColor: theme.colors.surface }]}
            />
          )}
          <Pressable onPress={handleChangePasswordPress}>
            <List.Item
              title="Change Password"
              description="Update your password"
              left={(props) => <List.Icon {...props} icon="lock-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={[styles.item, { backgroundColor: theme.colors.surface }]}
            />
          </Pressable>
          {isAdmin && (
            <Pressable onPress={handleUserManagementPress}>
              <List.Item
                title="User Management"
                description="Manage users and reset passwords"
                left={(props) => <List.Icon {...props} icon="account-group-outline" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                style={[styles.item, { backgroundColor: theme.colors.surface }]}
              />
            </Pressable>
          )}
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Pressable onPress={handleLogout}>
            <List.Item
              title="Logout"
              titleStyle={{ color: theme.colors.error }}
              left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
              style={[styles.item, { backgroundColor: theme.colors.surface }]}
            />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
            Blazelog Mobile v{appVersion}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  item: {
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  themeItem: {
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  segmentedButtons: {
    marginHorizontal: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
  },
});
