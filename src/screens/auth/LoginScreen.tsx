import React, { useState, useCallback } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { handleApiError, showErrorAlert } from '@/utils';
import { loginRateLimiter, usernameSchema } from '@/utils/validation';

const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const theme = useTheme();
  const { login, isLoading } = useAuthStore();
  const [isRateLimited, setIsRateLimited] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      // Check rate limiting
      if (!loginRateLimiter.isAllowed()) {
        const retryAfterMs = loginRateLimiter.getRetryAfter();
        const retryAfterSec = Math.ceil(retryAfterMs / 1000);
        setIsRateLimited(true);

        Alert.alert(
          'Too Many Attempts',
          `Please wait ${retryAfterSec} seconds before trying again.`,
          [{ text: 'OK' }]
        );

        // Auto-reset rate limited state after the timeout
        setTimeout(() => setIsRateLimited(false), retryAfterMs);
        return;
      }

      try {
        await login(data.username, data.password);
        // Reset rate limiter on successful login
        loginRateLimiter.reset();
      } catch (error) {
        const apiError = handleApiError(error);
        showErrorAlert(apiError, 'Login Failed');
      }
    },
    [login]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text variant="displaySmall" style={[styles.logo, { color: theme.colors.primary }]}>
              Blazelog
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
            >
              Real-time log monitoring
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Username"
                  value={value}
                  onChangeText={onChange}
                  onSubmitEditing={() => {}}
                  error={errors.username?.message}
                  autoCapitalize="none"
                  autoComplete="username"
                  returnKeyType="next"
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  style={styles.input}
                />
              )}
            />

            <Button
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isValid || isRateLimited}
              fullWidth
              style={styles.button}
            >
              {isRateLimited ? 'Please Wait...' : 'Sign In'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 8,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});
