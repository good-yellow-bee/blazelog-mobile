import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { LogStackParamList } from '@/types/navigation';
import { LogListScreen, LogDetailScreen, LogStreamScreen } from '@/screens/logs';

const Stack = createNativeStackNavigator<LogStackParamList>();

export const LogStack = () => {
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
      <Stack.Screen name="LogList" component={LogListScreen} options={{ title: 'Logs' }} />
      <Stack.Screen
        name="LogDetail"
        component={LogDetailScreen}
        options={{ title: 'Log Details' }}
      />
      <Stack.Screen
        name="LogStream"
        component={LogStreamScreen}
        options={{ title: 'Live Stream' }}
      />
    </Stack.Navigator>
  );
};
