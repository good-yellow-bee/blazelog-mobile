import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api';

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
  });
};

export const useProjectQuery = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId),
    enabled,
  });
};
