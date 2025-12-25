import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { storage } from '@/utils/storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.blazelog.dev';

// Token refresh timeout (30 seconds)
const TOKEN_REFRESH_TIMEOUT = 30000;

export const client = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
client.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and refresh token
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: Error) => void
) => {
  refreshSubscribers.push({ resolve, reject });
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onTokenRefreshFailed = (error: Error) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

// Lazy import to avoid circular dependency
let clearSessionFn: (() => Promise<void>) | null = null;

export const setSessionClearer = (fn: () => Promise<void>) => {
  clearSessionFn = fn;
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete with timeout
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Token refresh timeout'));
          }, TOKEN_REFRESH_TIMEOUT);

          subscribeTokenRefresh(
            (token) => {
              clearTimeout(timeoutId);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            },
            (err) => {
              clearTimeout(timeoutId);
              reject(err);
            }
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Use fresh axios instance to avoid interceptor loop
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;
        await storage.setAccessToken(access_token);
        await storage.setRefreshToken(refresh_token);

        onTokenRefreshed(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Notify all waiting subscribers of the failure
        const failureError =
          refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        onTokenRefreshFailed(failureError);

        // Refresh failed - clear session without calling logout API
        if (clearSessionFn) {
          await clearSessionFn();
        } else {
          await storage.clearTokens();
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Re-export for convenience
export { API_URL };
