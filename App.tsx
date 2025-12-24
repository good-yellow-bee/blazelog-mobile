import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  Theme,
  NavigationContainerRef,
} from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { queryClient, asyncStoragePersister, parseNotificationData } from '@/utils';
import { RootNavigator, linking } from '@/navigation';
import { useSettingsStore } from '@/store';
import { darkTheme, lightTheme, colors, lightColors } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';

const navigationDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.error,
  },
};

const navigationLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.textPrimary,
    border: lightColors.border,
    notification: lightColors.error,
  },
};

export default function App() {
  const { theme: themeMode } = useSettingsStore();
  const paperTheme = themeMode === 'light' ? lightTheme : darkTheme;
  const navTheme = themeMode === 'light' ? navigationLightTheme : navigationDarkTheme;
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Handle notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = parseNotificationData(response.notification);

      if (data.type === 'alert' && data.alertId && navigationRef.current) {
        // Navigate to alert detail screen
        navigationRef.current.navigate('Main', {
          screen: 'AlertsTab',
          params: {
            screen: 'AlertDetail',
            params: { alertId: data.alertId },
          },
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
              <RootNavigator />
              <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
