import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert as RNAlert } from 'react-native';
import { Text, useTheme, Divider, Chip, Switch, Portal, Dialog, Button as PaperButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { AlertStackScreenProps } from '@/types/navigation';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui';
import { useAlertQuery, useDeleteAlert, useUpdateAlert } from '@/hooks/useAlerts';

const severityColors: Record<string, { bg: string; text: string }> = {
  info: { bg: '#58a6ff30', text: '#58a6ff' },
  warning: { bg: '#d2992230', text: '#d29922' },
  critical: { bg: '#f8514930', text: '#f85149' },
};

export const AlertDetailScreen = () => {
  const theme = useTheme();
  const route = useRoute<AlertStackScreenProps<'AlertDetail'>['route']>();
  const navigation = useNavigation<AlertStackScreenProps<'AlertDetail'>['navigation']>();
  const { alertId } = route.params;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: alert, isLoading } = useAlertQuery(alertId);
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();

  const handleToggle = useCallback(
    (enabled: boolean) => {
      if (alert) {
        updateAlert.mutate({ id: alert.id, data: { enabled } });
      }
    },
    [alert, updateAlert]
  );

  const handleEdit = useCallback(() => {
    if (alert) {
      navigation.navigate('AlertForm', { alertId: alert.id });
    }
  }, [alert, navigation]);

  const handleDelete = useCallback(async () => {
    if (alert) {
      try {
        await deleteAlert.mutateAsync(alert.id);
        navigation.goBack();
      } catch (error) {
        RNAlert.alert('Error', 'Failed to delete alert');
      }
    }
  }, [alert, deleteAlert, navigation]);

  if (isLoading || !alert) {
    return <LoadingScreen message="Loading alert..." />;
  }

  const severityStyle = severityColors[alert.severity] || severityColors.info;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.titleRow}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
              {alert.name}
            </Text>
            <Switch
              value={alert.enabled}
              onValueChange={handleToggle}
              color={theme.colors.primary}
            />
          </View>
          {alert.description && (
            <Text
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {alert.description}
            </Text>
          )}
          <View style={styles.badges}>
            <Chip
              style={[styles.chip, { backgroundColor: severityStyle.bg }]}
              textStyle={{ color: severityStyle.text }}
              compact
            >
              {alert.severity.toUpperCase()}
            </Chip>
            <Chip style={styles.chip} compact>
              {alert.type.replace('_', ' ')}
            </Chip>
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Condition
          </Text>
          <Text style={[styles.mono, { color: theme.colors.onSurface }]}>
            {alert.condition}
          </Text>
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Configuration
          </Text>
          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: theme.colors.onSurfaceVariant }]}>
              Window
            </Text>
            <Text style={[styles.configValue, { color: theme.colors.onSurface }]}>
              {alert.window}
            </Text>
          </View>
          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: theme.colors.onSurfaceVariant }]}>
              Cooldown
            </Text>
            <Text style={[styles.configValue, { color: theme.colors.onSurface }]}>
              {alert.cooldown}
            </Text>
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Notify Channels
          </Text>
          <View style={styles.channels}>
            {alert.notify.map((channel) => (
              <Chip key={channel} style={styles.channelChip} compact>
                {channel}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button variant="outline" onPress={handleEdit} style={styles.actionButton}>
            Edit Alert
          </Button>
          <Button
            variant="secondary"
            onPress={() => setShowDeleteDialog(true)}
            style={styles.actionButton}
          >
            Delete Alert
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Alert</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete "{alert.name}"? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowDeleteDialog(false)}>Cancel</PaperButton>
            <PaperButton
              onPress={handleDelete}
              textColor={theme.colors.error}
              loading={deleteAlert.isPending}
            >
              Delete
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 14,
  },
  configValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  channels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelChip: {
    height: 28,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
