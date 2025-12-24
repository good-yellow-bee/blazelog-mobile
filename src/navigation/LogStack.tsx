import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { LogStackParamList } from '@/types/navigation';

// Placeholder screens - will be implemented in Phase 6
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>{name} - Coming Soon</Text>
  </View>
);

const LogListScreen = () => <PlaceholderScreen name="Log List" />;
const LogDetailScreen = () => <PlaceholderScreen name="Log Detail" />;
const LogStreamScreen = () => <PlaceholderScreen name="Log Stream" />;

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
      <Stack.Screen
        name="LogList"
        component={LogListScreen}
        options={{ title: 'Logs' }}
      />
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
