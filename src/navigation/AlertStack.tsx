import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { AlertStackParamList } from '@/types/navigation';

// Placeholder screens - will be implemented in Phase 7
import { View, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>{name} - Coming Soon</Text>
  </View>
);

const AlertListScreen = () => <PlaceholderScreen name="Alert List" />;
const AlertDetailScreen = () => <PlaceholderScreen name="Alert Detail" />;
const AlertFormScreen = () => <PlaceholderScreen name="Alert Form" />;

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
      <Stack.Screen
        name="AlertList"
        component={AlertListScreen}
        options={{ title: 'Alerts' }}
      />
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
