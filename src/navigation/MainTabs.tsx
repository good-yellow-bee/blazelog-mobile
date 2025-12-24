import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { MainTabParamList } from '@/types/navigation';
import { LogStack } from './LogStack';
import { AlertStack } from './AlertStack';
import { SettingsStack } from './SettingsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tab.Screen
        name="LogsTab"
        component={LogStack}
        options={{
          title: 'Logs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="text-box-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertStack}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
