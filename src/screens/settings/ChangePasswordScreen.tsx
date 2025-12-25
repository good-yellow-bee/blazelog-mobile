import React from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { useChangePassword } from '@/hooks/useUsers';
import { handleApiError, showErrorAlert } from '@/utils';
import { passwordSchema } from '@/utils/validation';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('Success', 'Your password has been changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const apiError = handleApiError(error);
      showErrorAlert(apiError, 'Failed to change password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Current Password"
              value={value}
              onChangeText={onChange}
              error={errors.currentPassword?.message}
              secureTextEntry
              autoComplete="password"
              style={styles.input}
            />
          )}
        />

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
              autoComplete="password"
              style={styles.input}
            />
          )}
        />

        <View style={styles.requirements}>
          <Text style={[styles.requirementsTitle, { color: theme.colors.onSurfaceVariant }]}>
            Password requirements:
          </Text>
          <Text style={[styles.requirementItem, { color: theme.colors.onSurfaceVariant }]}>
            {'\u2022'} At least 8 characters
          </Text>
          <Text style={[styles.requirementItem, { color: theme.colors.onSurfaceVariant }]}>
            {'\u2022'} One uppercase letter
          </Text>
          <Text style={[styles.requirementItem, { color: theme.colors.onSurfaceVariant }]}>
            {'\u2022'} One lowercase letter
          </Text>
          <Text style={[styles.requirementItem, { color: theme.colors.onSurfaceVariant }]}>
            {'\u2022'} One number
          </Text>
          <Text style={[styles.requirementItem, { color: theme.colors.onSurfaceVariant }]}>
            {'\u2022'} One special character
          </Text>
        </View>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm New Password"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              secureTextEntry
              autoComplete="password"
              style={styles.input}
            />
          )}
        />

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={changePassword.isPending}
          disabled={!isValid}
          fullWidth
          style={styles.submit}
        >
          Change Password
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
  requirements: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  submit: {
    marginTop: 8,
  },
});
