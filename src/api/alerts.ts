import { client } from './client';
import type { ApiEnvelope, Alert, AlertCreate, AlertUpdate } from './types';

export const alertsApi = {
  async getAlerts(projectId?: string): Promise<Alert[]> {
    const params = projectId ? { project_id: projectId } : undefined;
    const response = await client.get<ApiEnvelope<Alert[]>>('/alerts', { params });
    return response.data.data;
  },

  async getAlert(id: string): Promise<Alert> {
    const response = await client.get<ApiEnvelope<Alert>>(`/alerts/${id}`);
    return response.data.data;
  },

  async createAlert(data: AlertCreate): Promise<Alert> {
    const response = await client.post<ApiEnvelope<Alert>>('/alerts', data);
    return response.data.data;
  },

  async updateAlert(id: string, data: AlertUpdate): Promise<Alert> {
    const response = await client.put<ApiEnvelope<Alert>>(`/alerts/${id}`, data);
    return response.data.data;
  },

  async deleteAlert(id: string): Promise<void> {
    await client.delete(`/alerts/${id}`);
  },
};
