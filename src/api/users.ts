import { client } from './client';
import type {
  ApiEnvelope,
  User,
  UserCreate,
  UserUpdate,
  ChangePasswordRequest,
  ResetPasswordRequest,
  PushTokenRequest,
} from './types';

export const usersApi = {
  // Current user operations
  async getCurrentUser(): Promise<User> {
    const response = await client.get<ApiEnvelope<User>>('/users/me');
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const data: ChangePasswordRequest = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    await client.put('/users/me/password', data);
  },

  async registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    const data: PushTokenRequest = { token, platform };
    await client.post('/users/me/push-token', data);
  },

  async unregisterPushToken(): Promise<void> {
    await client.delete('/users/me/push-token');
  },

  // Admin operations
  async listUsers(): Promise<User[]> {
    const response = await client.get<ApiEnvelope<User[]>>('/users');
    return response.data.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await client.get<ApiEnvelope<User>>(`/users/${id}`);
    return response.data.data;
  },

  async createUser(data: UserCreate): Promise<User> {
    const response = await client.post<ApiEnvelope<User>>('/users', data);
    return response.data.data;
  },

  async updateUser(id: string, data: UserUpdate): Promise<User> {
    const response = await client.put<ApiEnvelope<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await client.delete(`/users/${id}`);
  },

  async resetUserPassword(id: string, password: string): Promise<void> {
    const data: ResetPasswordRequest = { password };
    await client.put(`/users/${id}/password`, data);
  },
};
