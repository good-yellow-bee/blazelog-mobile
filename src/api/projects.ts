import { client } from './client';
import type { ApiEnvelope, Project } from './types';

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await client.get<ApiEnvelope<Project[]>>('/projects');
    return response.data.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await client.get<ApiEnvelope<Project>>(`/projects/${id}`);
    return response.data.data;
  },
};
