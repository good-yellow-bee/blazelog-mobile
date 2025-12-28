import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Switch, SegmentedButtons, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AlertStackScreenProps } from '@/types/navigation';
import { Button, Input } from '@/components/ui';
import { LoadingScreen } from '@/components/common';
import { useAlertQuery, useCreateAlert, useUpdateAlert } from '@/hooks/useAlerts';
import { useProjectStore } from '@/store';
import { handleApiError, showErrorAlert } from '@/utils';
import { alertConditionSchema, durationSchema } from '@/utils/validation';
import type { AlertType, AlertSeverity } from '@/api/types';

const alertSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Name can only contain letters, numbers, spaces, dashes and underscores'
    ),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.enum(['error_rate', 'log_match', 'threshold']),
  condition: alertConditionSchema,
  severity: z.enum(['info', 'warning', 'critical']),
  window: durationSchema,
  cooldown: durationSchema,
  notify: z.array(z.string()).min(1, 'At least one channel required'),
  enabled: z.boolean(),
});

type AlertFormData = z.infer<typeof alertSchema>;

const ALERT_TYPES: { value: AlertType; label: string }[] = [
  { value: 'error_rate', label: 'Error Rate' },
  { value: 'log_match', label: 'Log Match' },
  { value: 'threshold', label: 'Threshold' },
];

const SEVERITIES: { value: AlertSeverity; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
];

const CHANNELS = ['email', 'slack', 'webhook', 'sms'];

export const AlertFormScreen = () => {
  const theme = useTheme();
  const route = useRoute<AlertStackScreenProps<'AlertForm'>['route']>();
  const navigation = useNavigation<AlertStackScreenProps<'AlertForm'>['navigation']>();
  const { currentProjectId } = useProjectStore();
  const { alertId } = route.params;
  const isEditing = !!alertId;

  const { data: existingAlert, isLoading: isLoadingAlert } = useAlertQuery(
    alertId || '',
    isEditing
  );

  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
      type: 'error_rate',
      condition: '',
      severity: 'warning',
      window: '5m',
      cooldown: '15m',
      notify: ['email'],
      enabled: true,
    },
  });

  useEffect(() => {
    if (existingAlert) {
      reset({
        name: existingAlert.name,
        description: existingAlert.description || '',
        type: existingAlert.type,
        condition: existingAlert.condition,
        severity: existingAlert.severity,
        window: existingAlert.window,
        cooldown: existingAlert.cooldown,
        notify: existingAlert.notify,
        enabled: existingAlert.enabled,
      });
    }
  }, [existingAlert, reset]);

  const selectedChannels = watch('notify');

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setValue(
        'notify',
        selectedChannels.filter((c) => c !== channel),
        { shouldValidate: true }
      );
    } else {
      setValue('notify', [...selectedChannels, channel], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AlertFormData) => {
    try {
      if (isEditing && alertId) {
        await updateAlert.mutateAsync({
          id: alertId,
          data: {
            ...data,
            description: data.description || undefined,
          },
        });
      } else {
        if (!currentProjectId) {
          showErrorAlert(
            { code: 'NO_PROJECT', status: 400, name: 'Error', message: 'No project selected' },
            'Error'
          );
          return;
        }
        await createAlert.mutateAsync({
          ...data,
          project_id: currentProjectId,
          description: data.description || undefined,
        });
      }
      navigation.goBack();
    } catch (error) {
      const apiError = handleApiError(error);
      showErrorAlert(apiError, 'Failed to save alert');
    }
  };

  if (isEditing && isLoadingAlert) {
    return <LoadingScreen message="Loading alert..." />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Alert Name"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description (optional)"
              value={value || ''}
              onChangeText={onChange}
              multiline
              numberOfLines={2}
              style={styles.input}
            />
          )}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Type</Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={ALERT_TYPES}
                style={styles.segmented}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="condition"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Condition Expression"
              value={value}
              onChangeText={onChange}
              error={errors.condition?.message}
              placeholder="e.g., error_count > 10"
              style={styles.input}
            />
          )}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Severity</Text>
          <Controller
            control={control}
            name="severity"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={SEVERITIES}
                style={styles.segmented}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <Controller
            control={control}
            name="window"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Window"
                value={value}
                onChangeText={onChange}
                error={errors.window?.message}
                placeholder="5m"
                style={[styles.input, styles.halfInput]}
              />
            )}
          />
          <Controller
            control={control}
            name="cooldown"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Cooldown"
                value={value}
                onChangeText={onChange}
                error={errors.cooldown?.message}
                placeholder="15m"
                style={[styles.input, styles.halfInput]}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            Notify Channels
          </Text>
          <View style={styles.chips}>
            {CHANNELS.map((channel) => (
              <Chip
                key={channel}
                selected={selectedChannels.includes(channel)}
                onPress={() => toggleChannel(channel)}
                style={styles.chip}
              >
                {channel}
              </Chip>
            ))}
          </View>
          {errors.notify && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.notify.message}
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name="enabled"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchRow}>
              <Text style={{ color: theme.colors.onSurface }}>Enable Alert</Text>
              <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
            </View>
          )}
        />

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={createAlert.isPending || updateAlert.isPending}
          disabled={!isValid}
          fullWidth
          style={styles.submit}
        >
          {isEditing ? 'Update Alert' : 'Create Alert'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmented: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  submit: {
    marginTop: 8,
  },
});
