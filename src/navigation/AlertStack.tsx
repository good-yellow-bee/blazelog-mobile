import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { AlertStackParamList } from '@/types/navigation';
import { AlertListScreen, AlertDetailScreen, AlertFormScreen } from '@/screens/alerts';

const Stack = createNativeStackNavigator<AlertStackParamList>();

export const AlertStack = () => {
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
      <Stack.Screen name="AlertList" component={AlertListScreen} options={{ title: 'Alerts' }} />
      <Stack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{ title: 'Alert Details' }}
      />
      <Stack.Screen
        name="AlertForm"
        component={AlertFormScreen}
        options={({ route }) => ({
          title: route.params?.alertId ? 'Edit Alert' : 'New Alert',
        })}
      />
    </Stack.Navigator>
  );
};
