import { client } from './client';
import type {
  ApiEnvelope,
  Connection,
  ConnectionCreate,
  ConnectionUpdate,
  ConnectionTestResult,
} from './types';

export const connectionsApi = {
  async getConnections(projectId?: string): Promise<Connection[]> {
    const params = projectId ? { project_id: projectId } : undefined;
    const response = await client.get<ApiEnvelope<Connection[]>>('/connections', { params });
    return response.data.data;
  },

  async getConnection(id: string): Promise<Connection> {
    const response = await client.get<ApiEnvelope<Connection>>(`/connections/${id}`);
    return response.data.data;
  },

  async createConnection(data: ConnectionCreate): Promise<Connection> {
    const response = await client.post<ApiEnvelope<Connection>>('/connections', data);
    return response.data.data;
  },

  async updateConnection(id: string, data: ConnectionUpdate): Promise<Connection> {
    const response = await client.put<ApiEnvelope<Connection>>(`/connections/${id}`, data);
    return response.data.data;
  },

  async deleteConnection(id: string): Promise<void> {
    await client.delete(`/connections/${id}`);
  },

  async testConnection(id: string): Promise<ConnectionTestResult> {
    const response = await client.post<ApiEnvelope<ConnectionTestResult>>(
      `/connections/${id}/test`
    );
    return response.data.data;
  },
};
