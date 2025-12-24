import { client } from './client';
import type { ApiEnvelope, Log, LogsResponse, LogFilters, LogStats, LogStatsParams } from './types';

export const logsApi = {
  async getLogs(params: LogFilters): Promise<LogsResponse> {
    const response = await client.get<ApiEnvelope<LogsResponse>>('/logs', { params });
    return response.data.data;
  },

  async getLog(id: string): Promise<Log> {
    const response = await client.get<ApiEnvelope<Log>>(`/logs/${id}`);
    return response.data.data;
  },

  async getLogStats(params: LogStatsParams): Promise<LogStats> {
    const response = await client.get<ApiEnvelope<LogStats>>('/logs/stats', { params });
    return response.data.data;
  },
};
