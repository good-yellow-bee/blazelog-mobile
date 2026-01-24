import { useAuthStore } from '@/store/authStore';
import { authApi, usersApi } from '@/api';
import { storage } from '@/utils';

// Mock the API modules
jest.mock('@/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
  usersApi: {
    getCurrentUser: jest.fn(),
  },
  setSessionClearer: jest.fn(),
}));

// Mock utils module
jest.mock('@/utils', () => ({
  storage: {
    getAccessToken: jest.fn(),
    clearTokens: jest.fn(),
  },
  registerForPushNotifications: jest.fn(() => Promise.resolve('test-token')),
  unregisterPushNotifications: jest.fn(() => Promise.resolve()),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock settingsStore
jest.mock('@/store/settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      notificationsEnabled: true,
      _hasHydrated: true,
    }),
    subscribe: jest.fn(),
  },
  waitForSettingsHydration: jest.fn(() => Promise.resolve()),
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useAuthStore.getState();

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should authenticate user on successful login', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (authApi.login as jest.Mock).mockResolvedValue(undefined);
      (usersApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().login('testuser', 'password');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(authApi.login).toHaveBeenCalledWith('testuser', 'password');
    });

    it('should set loading state during login', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (authApi.login as jest.Mock).mockImplementation(() => {
        expect(useAuthStore.getState().isLoading).toBe(true);
        return Promise.resolve();
      });
      (usersApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().login('testuser', 'password');
    });

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials');
      (authApi.login as jest.Mock).mockRejectedValue(error);

      await expect(useAuthStore.getState().login('testuser', 'wrong-password')).rejects.toThrow(
        'Invalid credentials'
      );

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        isAuthenticated: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'viewer' as const,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        isLoading: false,
      });

      (authApi.logout as jest.Mock).mockResolvedValue(undefined);
      (storage.clearTokens as jest.Mock).mockResolvedValue(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should authenticate when token exists and is valid', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (storage.getAccessToken as jest.Mock).mockResolvedValue('valid-token');
      (usersApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should not authenticate when no token exists', async () => {
      (storage.getAccessToken as jest.Mock).mockResolvedValue(null);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
