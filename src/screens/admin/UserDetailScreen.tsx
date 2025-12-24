import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import {
  Text,
  useTheme,
  Divider,
  Chip,
  Portal,
  Dialog,
  Button as PaperButton,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SettingsStackScreenProps } from '@/types/navigation';
import { LoadingScreen } from '@/components/common';
import { Button, Input } from '@/components/ui';
import { useUserQuery, useCurrentUser, useResetUserPassword } from '@/hooks/useUsers';
import { handleApiError, showErrorAlert } from '@/utils';
import type { UserRole } from '@/api/types';

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: '#f8514930', text: '#f85149' },
  operator: { bg: '#58a6ff30', text: '#58a6ff' },
  viewer: { bg: '#8b949e30', text: '#8b949e' },
};

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  operator: 2,
  viewer: 1,
};

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const UserDetailScreen = () => {
  const theme = useTheme();
  const route = useRoute<SettingsStackScreenProps<'UserDetail'>['route']>();
  const navigation = useNavigation();
  const { userId } = route.params;
  const [showResetDialog, setShowResetDialog] = useState(false);

  const { data: user, isLoading } = useUserQuery(userId);
  const { data: currentUser } = useCurrentUser();
  const resetPassword = useResetUserPassword();

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
    },
  });

  const canResetPassword =
    user &&
    currentUser &&
    user.id !== currentUser.id &&
    roleHierarchy[currentUser.role] > roleHierarchy[user.role];

  const handleResetPassword = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        await resetPassword.mutateAsync({
          userId,
          password: data.newPassword,
        });
        setShowResetDialog(false);
        resetForm();
        Alert.alert('Success', 'Password has been reset successfully');
      } catch (error) {
        const apiError = handleApiError(error);
        showErrorAlert(apiError, 'Failed to reset password');
      }
    },
    [resetPassword, userId, resetForm]
  );

  if (isLoading || !user) {
    return <LoadingScreen message="Loading user..." />;
  }

  const roleStyle = roleColors[user.role];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            {user.username}
          </Text>
          <Chip
            style={[styles.roleChip, { backgroundColor: roleStyle.bg }]}
            textStyle={{ color: roleStyle.text }}
          >
            {user.role.toUpperCase()}
          </Chip>
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Contact
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Email
            </Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>
              {user.email}
            </Text>
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Account Info
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Created
            </Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>
              {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Updated
            </Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>
              {new Date(user.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {canResetPassword && (
          <View style={styles.actions}>
            <Button
              variant="secondary"
              onPress={() => setShowResetDialog(true)}
              fullWidth
            >
              Reset Password
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={showResetDialog} onDismiss={() => setShowResetDialog(false)}>
          <Dialog.Title>Reset Password</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>
              Set a new password for {user.username}
            </Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="New Password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.newPassword?.message}
                  secureTextEntry
                />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowResetDialog(false)}>Cancel</PaperButton>
            <PaperButton
              onPress={handleSubmit(handleResetPassword)}
              disabled={!isValid}
              loading={resetPassword.isPending}
            >
              Reset
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleChip: {
    height: 28,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    padding: 16,
  },
});
