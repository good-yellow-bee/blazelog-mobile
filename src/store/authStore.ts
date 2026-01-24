import { create } from 'zustand';
import { authApi, usersApi, setSessionClearer } from '@/api';
import {
  storage,
  registerForPushNotifications,
  unregisterPushNotifications,
  logger,
} from '@/utils';
import { useSettingsStore, waitForSettingsHydration } from './settingsStore';
import type { User } from '@/api/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

/**
 * Register for push notifications only if enabled in settings.
 * Waits for settings store to be hydrated from AsyncStorage first.
 */
const tryRegisterPushNotifications = async () => {
  try {
    // Wait for settings to be loaded from AsyncStorage
    await waitForSettingsHydration();

    const { notificationsEnabled } = useSettingsStore.getState();
    if (notificationsEnabled) {
      await registerForPushNotifications();
    } else {
      logger.info('Push notifications disabled in settings, skipping registration');
    }
  } catch (err) {
    logger.error('Push notification registration failed', err);
  }
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const clearSession = async () => {
    await storage.clearTokens();
    set({ isAuthenticated: false, user: null, isLoading: false });
  };

  // Register clearSession with client interceptor
  setSessionClearer(clearSession);

  return {
    isAuthenticated: false,
    isLoading: true,
    user: null,

    login: async (username: string, password: string) => {
      set({ isLoading: true });
      try {
        await authApi.login(username, password);
        const user = await usersApi.getCurrentUser();
        set({ isAuthenticated: true, user, isLoading: false });
        // Register for push notifications after successful login (respects settings)
        // Fire and forget - don't block login completion
        tryRegisterPushNotifications();
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        // Unregister push token before logging out
        await unregisterPushNotifications();
        await authApi.logout();
      } finally {
        await get().clearSession();
      }
    },

    clearSession,

    checkAuth: async () => {
      set({ isLoading: true });
      try {
        const token = await storage.getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }
        const user = await usersApi.getCurrentUser();
        set({ isAuthenticated: true, user, isLoading: false });
        // Register for push notifications after auth check (respects settings)
        // Fire and forget - don't block auth check completion
        tryRegisterPushNotifications();
      } catch {
        await get().clearSession();
      }
    },
  };
});
