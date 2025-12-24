import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { SettingsStackParamList } from '@/types/navigation';
import { SettingsScreen, ChangePasswordScreen } from '@/screens/settings';
import { UserListScreen, UserDetailScreen } from '@/screens/admin';
import { ProjectSwitcherScreen } from '@/screens/projects';

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
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen name="UserList" component={UserListScreen} options={{ title: 'Users' }} />
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
