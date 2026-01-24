import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/api';
import type { Alert, AlertCreate, AlertUpdate, AlertHistoryParams } from '@/api/types';

export const useAlertsQuery = (projectId?: string) => {
  return useQuery({
    queryKey: ['alerts', projectId],
    queryFn: () => alertsApi.getAlerts(projectId),
    enabled: !!projectId,
  });
};

export const useAlertHistoryQuery = (params?: AlertHistoryParams) => {
  // Flatten params into stable query key parts to avoid object reference comparison issues
  return useQuery({
    queryKey: [
      'alertHistory',
      params?.alert_id,
      params?.project_id,
      params?.page,
      params?.per_page,
    ],
    queryFn: () => alertsApi.getAlertHistory(params),
  });
};

export const useAlertQuery = (alertId: string, enabled = true) => {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => alertsApi.getAlert(alertId),
    enabled,
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AlertCreate) => alertsApi.createAlert(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alerts', variables.project_id] });
    },
  });
};

export const useUpdateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlertUpdate }) =>
      alertsApi.updateAlert(id, data),
    onSuccess: (alert) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', alert.id] });
    },
  });
};

export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useToggleAlert = () => {
  const updateAlert = useUpdateAlert();

  return useMutation({
    mutationFn: ({ alert, enabled }: { alert: Alert; enabled: boolean }) =>
      updateAlert.mutateAsync({
        id: alert.id,
        data: { enabled },
      }),
  });
};
