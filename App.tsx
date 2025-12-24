import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { queryClient, asyncStoragePersister } from '@/utils';
import { RootNavigator, linking } from '@/navigation';
import { useSettingsStore } from '@/store';
import { darkTheme, lightTheme, colors, lightColors } from '@/theme';

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

  return (
    <GestureHandlerRootView style={styles.container}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <PaperProvider theme={paperTheme}>
          <SafeAreaProvider>
            <NavigationContainer linking={linking} theme={navTheme}>
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
