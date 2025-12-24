import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { RootStackParamList } from '@/types/navigation';
import { useAuthStore } from '@/store';
import { MainTabs } from './MainTabs';

// Placeholder Login - will be implemented in Phase 5
import { Text, TextInput, Pressable } from 'react-native';

const LoginScreen = () => {
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await login(username, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Blazelog</Text>
      <TextInput
        style={loginStyles.input}
        placeholder="Username"
        placeholderTextColor="#8b949e"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={loginStyles.input}
        placeholder="Password"
        placeholderTextColor="#8b949e"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={loginStyles.error}>{error}</Text> : null}
      <Pressable
        style={[loginStyles.button, isLoading && loginStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={loginStyles.buttonText}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Text>
      </Pressable>
    </View>
  );
};

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0d1117',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d9ff',
    textAlign: 'center',
    marginBottom: 48,
  },
  input: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    padding: 16,
    color: '#e6edf3',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  error: {
    color: '#f85149',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00d9ff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0d1117',
    fontWeight: '600',
    fontSize: 16,
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const theme = useTheme();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
