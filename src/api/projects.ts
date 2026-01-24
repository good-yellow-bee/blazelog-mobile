import { client } from './client';
import type {
  ApiEnvelope,
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectUser,
  AddProjectUserRequest,
} from './types';

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await client.get<ApiEnvelope<Project[]>>('/projects');
    return response.data.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await client.get<ApiEnvelope<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await client.post<ApiEnvelope<Project>>('/projects', data);
    return response.data.data;
  },

  async updateProject(id: string, data: ProjectUpdate): Promise<Project> {
    const response = await client.put<ApiEnvelope<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await client.delete(`/projects/${id}`);
  },

  // Project membership endpoints
  async getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    const response = await client.get<ApiEnvelope<ProjectUser[]>>(`/projects/${projectId}/users`);
    return response.data.data;
  },

  async addProjectUser(projectId: string, data: AddProjectUserRequest): Promise<void> {
    await client.post(`/projects/${projectId}/users`, data);
  },

  async removeProjectUser(projectId: string, userId: string): Promise<void> {
    await client.delete(`/projects/${projectId}/users/${userId}`);
  },
};
