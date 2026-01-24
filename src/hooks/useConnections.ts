import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '@/api';
import type { ConnectionCreate, ConnectionUpdate } from '@/api/types';

export const useConnectionsQuery = (projectId?: string) => {
  return useQuery({
    queryKey: ['connections', projectId],
    queryFn: () => connectionsApi.getConnections(projectId),
  });
};

export const useConnectionQuery = (connectionId: string, enabled = true) => {
  return useQuery({
    queryKey: ['connection', connectionId],
    queryFn: () => connectionsApi.getConnection(connectionId),
    enabled,
  });
};

export const useCreateConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectionCreate) => connectionsApi.createConnection(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['connections', undefined] });
    },
  });
};

export const useUpdateConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConnectionUpdate }) =>
      connectionsApi.updateConnection(id, data),
    onSuccess: (connection) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection', connection.id] });
    },
  });
};

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => connectionsApi.deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: (id: string) => connectionsApi.testConnection(id),
  });
};
