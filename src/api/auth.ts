import { client } from './client';
import { storage } from '@/utils/storage';
import type { ApiEnvelope, LoginResponse, RefreshResponse } from './types';

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await client.post<ApiEnvelope<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    const data = response.data.data;

    // Store tokens
    await storage.setAccessToken(data.access_token);
    await storage.setRefreshToken(data.refresh_token);

    return data;
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await client.post<ApiEnvelope<RefreshResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const data = response.data.data;

    // Store new tokens
    await storage.setAccessToken(data.access_token);
    await storage.setRefreshToken(data.refresh_token);

    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = await storage.getRefreshToken();
    if (refreshToken) {
      try {
        await client.post('/auth/logout', { refresh_token: refreshToken });
      } catch {
        // Ignore errors - clear tokens anyway
      }
    }
    await storage.clearTokens();
  },
};
