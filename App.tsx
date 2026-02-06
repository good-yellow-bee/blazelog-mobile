import React, { useEffect, useRef, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
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
import { ErrorBoundary } from '@/components/common';
import { useSettingsStore } from '@/store';
import { createBlazelogTheme, colors, lightColors } from '@/theme';
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
  const systemColorScheme = useColorScheme();

  // Resolve the effective theme: 'system' follows device preference
  const isDark = themeMode === 'system' ? systemColorScheme !== 'light' : themeMode !== 'light';

  const paperTheme = useMemo(() => createBlazelogTheme(isDark), [isDark]);
  const navTheme = isDark ? navigationDarkTheme : navigationLightTheme;
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
            <ErrorBoundary>
              <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
                <RootNavigator />
                <StatusBar style={isDark ? 'light' : 'dark'} />
              </NavigationContainer>
            </ErrorBoundary>
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
