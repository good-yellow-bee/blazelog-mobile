import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { SettingsStackParamList } from '@/types/navigation';

// Placeholder screens - will be implemented in Phase 8
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>{name} - Coming Soon</Text>
  </View>
);

const SettingsScreen = () => <PlaceholderScreen name="Settings" />;
const ChangePasswordScreen = () => <PlaceholderScreen name="Change Password" />;
const UserListScreen = () => <PlaceholderScreen name="User List" />;
const UserDetailScreen = () => <PlaceholderScreen name="User Detail" />;
const ProjectSwitcherScreen = () => <PlaceholderScreen name="Project Switcher" />;

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  text: {
    color: '#8b949e',
    fontSize: 18,
  },
});

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={{ title: 'Users' }}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ title: 'User Details' }}
      />
      <Stack.Screen
        name="ProjectSwitcher"
        component={ProjectSwitcherScreen}
        options={{ title: 'Switch Project' }}
      />
    </Stack.Navigator>
  );
};
