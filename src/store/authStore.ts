import { create } from 'zustand';
import { authApi, usersApi, setSessionClearer } from '@/api';
import { storage, registerForPushNotifications } from '@/utils';
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
        // Register for push notifications after successful login
        registerForPushNotifications().catch(console.error);
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
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
        // Register for push notifications after auth check
        registerForPushNotifications().catch(console.error);
      } catch {
        await get().clearSession();
      }
    },
  };
});
