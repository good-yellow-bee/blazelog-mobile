import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotifications, unregisterPushNotifications, logger } from '@/utils';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  _hasHydrated: boolean;
}

interface SettingsActions {
  setTheme: (theme: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      notificationsEnabled: true,
      _hasHydrated: false,

      setTheme: (theme) => {
        set({ theme });
      },

      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
        // Register or unregister push token based on new setting
        if (enabled) {
          registerForPushNotifications().catch((err) =>
            logger.error('Push notification registration failed', err)
          );
        } else {
          unregisterPushNotifications().catch((err) =>
            logger.error('Push notification unregistration failed', err)
          );
        }
      },
    }),
    {
      name: 'blazelog-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        // Use store's setState directly since the callback's state parameter
        // is the rehydrated data, not the store instance with methods
        useSettingsStore.setState({ _hasHydrated: true });
      },
      partialize: (state) => ({
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

/**
 * Wait for settings store to be hydrated from AsyncStorage.
 * Returns immediately if already hydrated, otherwise waits for hydration.
 */
export const waitForSettingsHydration = (): Promise<void> => {
  return new Promise((resolve) => {
    if (useSettingsStore.getState()._hasHydrated) {
      resolve();
      return;
    }
    const unsubscribe = useSettingsStore.subscribe((state) => {
      if (state._hasHydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
};
