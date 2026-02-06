import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Switch, useTheme, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Alert, AlertSeverity } from '@/api/types';
import type { BlazelogTheme } from '@/theme';

interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
  onToggle: (alert: Alert, enabled: boolean) => void;
}

const severityToColorKey: Record<AlertSeverity, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
};

export const AlertCard = React.memo(({ alert, onPress, onToggle }: AlertCardProps) => {
  const theme = useTheme<BlazelogTheme>();
  const severityColor = theme.custom.colors[severityToColorKey[alert.severity]];

  const handleToggle = () => {
    onToggle(alert, !alert.enabled);
  };

  return (
    <Pressable
      onPress={() => onPress(alert)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={20}
            color={alert.enabled ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.name,
              { color: alert.enabled ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={1}
          >
            {alert.name}
          </Text>
        </View>
        <Switch value={alert.enabled} onValueChange={handleToggle} color={theme.colors.primary} />
      </View>

      {alert.description ? (
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={2}
        >
          {alert.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Chip
          style={[styles.severityChip, { backgroundColor: `${severityColor}30` }]}
          textStyle={[styles.severityText, { color: severityColor }]}
          compact
        >
          {alert.severity.toUpperCase()}
        </Chip>
        <Text style={[styles.type, { color: theme.colors.onSurfaceVariant }]}>
          {alert.type.replace('_', ' ')}
        </Text>
      </View>
    </Pressable>
  );
});

AlertCard.displayName = 'AlertCard';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityChip: {
    height: 24,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  type: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
