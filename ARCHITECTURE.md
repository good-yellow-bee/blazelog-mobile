# Blazelog Mobile - React Native Client

## Overview

Mobile client for [blazelog](https://github.com/good-yellow-bee/blazelog) log management system.

## Backend API Summary

| Aspect | Details |
|--------|---------|
| Base URL | `/api/v1` |
| Auth | JWT + Refresh tokens (15min / 7day TTL) |
| Format | JSON REST |
| Docs | OpenAPI 3.0 spec at `blazelog/docs/api/openapi.yaml` |
| Streaming | SSE for real-time logs |

## Tech Stack

| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | React Native (Expo managed) | Faster iteration, OTA updates, simpler native config |
| State | Zustand | Minimal boilerplate, TypeScript-first, easy persistence |
| API | TanStack Query + Axios | Caching, retry logic, mutations, background refetch |
| Navigation | React Navigation v6 | Industry standard, deep linking support |
| UI Components | React Native Paper | Material Design 3, theming, accessibility |
| Forms | React Hook Form + Zod | Type-safe validation, minimal re-renders |
| Secure Storage | expo-secure-store | Encrypted keychain/keystore access |
| Testing | Jest + React Native Testing Library + Maestro | Unit, component, and E2E coverage |

## Project Structure

```
blazelog-mobile/
├── app.json                    # Expo configuration
├── babel.config.js
├── tsconfig.json
├── package.json
├── App.tsx                     # Entry point
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── types.ts            # Generated from OpenAPI
│   │   ├── auth.ts             # Auth API functions
│   │   ├── logs.ts             # Log API functions
│   │   ├── alerts.ts           # Alert API functions
│   │   └── projects.ts         # Project API functions
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── logs/               # Log-specific components
│   │   │   ├── LogEntry.tsx
│   │   │   ├── LogList.tsx
│   │   │   ├── LogFilter.tsx
│   │   │   └── LogLevelBadge.tsx
│   │   ├── alerts/             # Alert-specific components
│   │   └── common/             # Shared components (Header, EmptyState, etc.)
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── logs/
│   │   │   ├── LogListScreen.tsx
│   │   │   ├── LogDetailScreen.tsx
│   │   │   └── LogStreamScreen.tsx
│   │   ├── alerts/
│   │   │   ├── AlertListScreen.tsx
│   │   │   ├── AlertDetailScreen.tsx
│   │   │   └── AlertFormScreen.tsx
│   │   ├── projects/
│   │   │   └── ProjectSwitcherScreen.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # Auth check, main navigation setup
│   │   ├── MainTabs.tsx        # Bottom tab navigator
│   │   ├── LogStack.tsx        # Log-related screens stack
│   │   ├── AlertStack.tsx      # Alert-related screens stack
│   │   └── linking.ts          # Deep link configuration
│   ├── store/
│   │   ├── authStore.ts        # Auth state (tokens, user)
│   │   ├── projectStore.ts     # Current project selection
│   │   ├── settingsStore.ts    # App preferences
│   │   └── index.ts            # Store exports
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth operations hook
│   │   ├── useLogs.ts          # TanStack Query hooks for logs
│   │   ├── useAlerts.ts        # TanStack Query hooks for alerts
│   │   ├── useSSE.ts           # SSE connection hook
│   │   └── useNetworkStatus.ts # Online/offline detection
│   ├── utils/
│   │   ├── storage.ts          # Secure storage helpers
│   │   ├── date.ts             # Date formatting
│   │   ├── logger.ts           # App logging utility
│   │   └── constants.ts        # App constants
│   ├── theme/
│   │   ├── index.ts            # Theme configuration
│   │   ├── colors.ts           # Color palette
│   │   └── spacing.ts          # Spacing scale
│   └── types/
│       ├── navigation.ts       # Navigation param types
│       └── env.d.ts            # Environment variable types
├── assets/
│   ├── images/
│   └── fonts/
├── __tests__/                  # Test files mirroring src structure
└── .maestro/                   # E2E test flows
    ├── login.yaml
    └── view-logs.yaml
```

## Available Endpoints

### Auth
- `POST /auth/login` - Get access + refresh tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Revoke tokens

### Logs

#### `GET /logs` - Query logs (paginated, filterable)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string (UUID) | Filter by project (required) |
| `level` | string | Filter by level: `debug`, `info`, `warn`, `error`, `fatal` |
| `search` | string | Full-text search in message and metadata |
| `start_time` | string (ISO 8601) | Start of time range |
| `end_time` | string (ISO 8601) | End of time range |
| `cursor` | string | Pagination cursor (from previous response) |
| `limit` | integer | Results per page (default: 50, max: 100) |

#### `GET /logs/stats` - Log statistics

Returns aggregated counts by level, project, and time buckets.

#### `GET /logs/stream` - SSE real-time stream

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string (UUID) | Stream logs for project (required) |
| `level` | string | Minimum level to stream |

**SSE Events:**
- `log` - New log entry
- `heartbeat` - Keep-alive (every 30s)
- `error` - Stream error

### Resources
- `GET/POST/PUT/DELETE /alerts` - Alert management
- `GET/POST/PUT/DELETE /projects` - Project management
- `GET /users/me` - Current user profile

## Response Schemas

### Log

```typescript
interface Log {
  id: string;                    // UUID
  project_id: string;            // UUID
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;             // ISO 8601
  metadata: Record<string, unknown>;
  source?: string;               // Service/component name
  trace_id?: string;             // Distributed tracing ID
}
```

### Alert

```typescript
interface Alert {
  id: string;                    // UUID
  project_id: string;            // UUID
  name: string;
  description?: string;
  condition: {
    level: 'warn' | 'error' | 'fatal';
    threshold: number;           // Count threshold
    window_minutes: number;      // Time window
    search?: string;             // Optional search filter
  };
  channels: AlertChannel[];      // Notification targets
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'push';
  config: Record<string, string>;
}
```

### Project

```typescript
interface Project {
  id: string;                    // UUID
  name: string;
  slug: string;                  // URL-safe identifier
  api_key: string;               // For log ingestion (read-only in app)
  created_at: string;
  updated_at: string;
}
```

### User

```typescript
interface User {
  id: string;                    // UUID
  email: string;
  name: string;
  avatar_url?: string;
  projects: ProjectMembership[];
}

interface ProjectMembership {
  project_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;               // null if no more pages
  has_more: boolean;
}
```

## Environment Configuration

Use Expo's environment variables with `app.config.ts`:

```typescript
// app.config.ts
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL ?? 'https://api.blazelog.dev',
      environment: process.env.APP_ENV ?? 'development',
    },
  },
};
```

**Environment files:**

| File | Purpose |
|------|---------|
| `.env.development` | Local development |
| `.env.staging` | Staging builds |
| `.env.production` | Production builds |

```bash
# .env.example
API_URL=https://api.blazelog.dev
APP_ENV=development
```

Access in code:
```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

## Authentication & Token Management

### Secure Storage

Tokens stored using `expo-secure-store`:

```typescript
// src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'blazelog_access_token',
  REFRESH_TOKEN: 'blazelog_refresh_token',
};

export const storage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },
  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  },
  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  },
};
```

### Axios Interceptors with Token Refresh

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { authStore } from '../store/authStore';

const client = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl + '/api/v1',
  timeout: 10000,
});

// Request interceptor - attach access token
client.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${Constants.expoConfig?.extra?.apiUrl}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = response.data;
        await storage.setAccessToken(access_token);
        await storage.setRefreshToken(refresh_token);

        onTokenRefreshed(access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await storage.clearTokens();
        authStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { client };
```

### Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { storage } from '../utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const authStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  login: async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    const { access_token, refresh_token, user } = response.data;
    
    await storage.setAccessToken(access_token);
    await storage.setRefreshToken(refresh_token);
    
    set({ isAuthenticated: true, user });
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // Ignore errors - clear tokens anyway
    }
    await storage.clearTokens();
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      
      const response = await client.get('/users/me');
      set({ isAuthenticated: true, user: response.data, isLoading: false });
    } catch {
      await storage.clearTokens();
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));
```

## Error Handling

### API Error Structure

```typescript
interface ApiError {
  code: string;           // Machine-readable code: 'INVALID_CREDENTIALS', 'RATE_LIMITED', etc.
  message: string;        // Human-readable message
  details?: Record<string, string[]>; // Field-level validation errors
}
```

### Error Handling Strategy

```typescript
// src/utils/errors.ts
import { AxiosError } from 'axios';
import { Alert } from 'react-native';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(error: AxiosError<{ code: string; message: string; details?: Record<string, string[]> }>) {
    super(error.response?.data?.message ?? 'An error occurred');
    this.code = error.response?.data?.code ?? 'UNKNOWN_ERROR';
    this.status = error.response?.status ?? 500;
    this.details = error.response?.data?.details;
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return new ApiError(error);
  }
  return new ApiError({
    response: { data: { code: 'UNKNOWN_ERROR', message: String(error) }, status: 500 },
  } as AxiosError);
};

// Show user-friendly error messages
export const showErrorAlert = (error: ApiError) => {
  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    RATE_LIMITED: 'Too many requests. Please wait a moment.',
    NETWORK_ERROR: 'No internet connection',
    SERVER_ERROR: 'Something went wrong. Please try again.',
  };

  Alert.alert('Error', messages[error.code] ?? error.message);
};
```

### TanStack Query Error Handling

```typescript
// src/hooks/useLogs.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import { handleApiError, showErrorAlert } from '../utils/errors';

export const useLogs = (projectId: string, filters: LogFilters) => {
  return useInfiniteQuery({
    queryKey: ['logs', projectId, filters],
    queryFn: async ({ pageParam }) => {
      try {
        const response = await client.get('/logs', {
          params: { project_id: projectId, cursor: pageParam, ...filters },
        });
        return response.data as PaginatedResponse<Log>;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    onError: (error) => {
      if (error instanceof ApiError) {
        showErrorAlert(error);
      }
    },
  });
};
```

## Offline Support

### Strategy

1. **Cache-first for reads**: TanStack Query caches API responses
2. **Queue writes for later**: Mutations queued when offline, synced when online
3. **Persist cache**: Use MMKV for fast, persistent cache storage

### Implementation

```typescript
// src/utils/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const mmkvStorage = {
  setItem: (key: string, value: string) => storage.set(key, value),
  getItem: (key: string) => storage.getString(key) ?? null,
  removeItem: (key: string) => storage.delete(key),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: mmkvStorage,
});
```

### Network Status Hook

```typescript
// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
      setConnectionType(state.type);
    });

    return unsubscribe;
  }, []);

  return { isOnline, connectionType };
};
```

### Offline Banner Component

```typescript
// src/components/common/OfflineBanner.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You're offline. Some features may be limited.</Text>
    </View>
  );
};
```

## SSE Real-Time Streaming

### SSE Hook with Reconnection

```typescript
// src/hooks/useSSE.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { storage } from '../utils/storage';
import { useNetworkStatus } from './useNetworkStatus';
import Constants from 'expo-constants';

interface UseSSEOptions {
  projectId: string;
  level?: string;
  onLog: (log: Log) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const useSSE = ({ projectId, level, onLog, onError, enabled = true }: UseSSEOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isOnline } = useNetworkStatus();

  const MAX_RETRIES = 10;
  const BASE_DELAY = 1000; // 1 second
  const MAX_DELAY = 30000; // 30 seconds

  const getBackoffDelay = useCallback((retry: number): number => {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(BASE_DELAY * 2 ** retry, MAX_DELAY);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return exponentialDelay + jitter;
  }, []);

  const connect = useCallback(async () => {
    if (!enabled || !isOnline) return;

    const token = await storage.getAccessToken();
    if (!token) return;

    const baseUrl = Constants.expoConfig?.extra?.apiUrl;
    const params = new URLSearchParams({ project_id: projectId });
    if (level) params.append('level', level);

    // Note: React Native doesn't have native EventSource
    // Use react-native-sse or polyfill
    const url = `${baseUrl}/api/v1/logs/stream?${params}`;
    
    const eventSource = new EventSource(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    eventSource.addEventListener('log', (event: MessageEvent) => {
      try {
        const log = JSON.parse(event.data) as Log;
        onLog(log);
      } catch (e) {
        console.error('Failed to parse log event:', e);
      }
    });

    eventSource.addEventListener('heartbeat', () => {
      // Reset retry count on successful heartbeat
      setRetryCount(0);
    });

    eventSource.addEventListener('error', (event: Event) => {
      setIsConnected(false);
      eventSource.close();

      if (retryCount < MAX_RETRIES) {
        const delay = getBackoffDelay(retryCount);
        console.log(`SSE reconnecting in ${delay}ms (attempt ${retryCount + 1})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          connect();
        }, delay);
      } else {
        onError?.(new Error('SSE connection failed after max retries'));
      }
    });

    eventSource.addEventListener('open', () => {
      setIsConnected(true);
      setRetryCount(0);
    });

    eventSourceRef.current = eventSource;
  }, [enabled, isOnline, projectId, level, onLog, onError, retryCount, getBackoffDelay]);

  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Reconnect when coming back online
  useEffect(() => {
    if (isOnline && enabled && !isConnected) {
      setRetryCount(0);
      connect();
    }
  }, [isOnline, enabled, isConnected, connect]);

  return { isConnected, retryCount, disconnect, reconnect: connect };
};
```

### Using SSE in Log Stream Screen

```typescript
// src/screens/logs/LogStreamScreen.tsx
import { useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useSSE } from '../../hooks/useSSE';
import { useProjectStore } from '../../store/projectStore';
import { LogEntry } from '../../components/logs/LogEntry';

export const LogStreamScreen = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { currentProjectId } = useProjectStore();
  const MAX_LOGS = 500; // Prevent memory issues

  const handleLog = useCallback((log: Log) => {
    setLogs((prev) => {
      const updated = [log, ...prev];
      return updated.slice(0, MAX_LOGS);
    });
  }, []);

  const { isConnected, retryCount } = useSSE({
    projectId: currentProjectId,
    onLog: handleLog,
    enabled: !!currentProjectId,
  });

  return (
    <View>
      <StreamStatus isConnected={isConnected} retryCount={retryCount} />
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogEntry log={item} />}
        inverted
      />
    </View>
  );
};
```

## Deep Linking

### Configuration

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'blazelog://', 'https://app.blazelog.dev'],
  config: {
    screens: {
      Main: {
        screens: {
          Logs: {
            screens: {
              LogList: 'logs',
              LogDetail: 'logs/:logId',
              LogStream: 'logs/stream',
            },
          },
          Alerts: {
            screens: {
              AlertList: 'alerts',
              AlertDetail: 'alerts/:alertId',
              AlertForm: 'alerts/new',
            },
          },
          Settings: 'settings',
        },
      },
      Login: 'login',
    },
  },
};
```

### URL Schemes

| Platform | Scheme | Example |
|----------|--------|---------|
| iOS/Android | `blazelog://` | `blazelog://logs/abc123` |
| Universal Links | `https://app.blazelog.dev/` | `https://app.blazelog.dev/logs/abc123` |

### Handling Deep Links

```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { linking } from './linking';

export const RootNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      {/* ... */}
    </NavigationContainer>
  );
};
```

## Push Notifications

### Setup

1. **Expo Notifications**: `expo install expo-notifications expo-device`
2. **FCM for Android**: Configure in `app.json`
3. **APNs for iOS**: Configure in Apple Developer Console

### Registration

```typescript
// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { client } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Get Expo push token (works for both iOS and Android)
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Register token with backend
  await client.post('/users/me/push-token', {
    token,
    platform: Platform.OS,
  });

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alert Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
    });
  }

  return token;
};
```

### Notification Payload

```typescript
interface AlertNotification {
  type: 'alert_triggered';
  alert_id: string;
  alert_name: string;
  project_id: string;
  project_name: string;
  log_count: number;
  sample_log_id?: string;
}
```

### Handling Notification Taps

```typescript
// App.tsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle notification tap when app is in background/quit
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as AlertNotification;
      
      if (data.type === 'alert_triggered') {
        navigation.navigate('Alerts', {
          screen: 'AlertDetail',
          params: { alertId: data.alert_id },
        });
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  // ...
}
```

## Testing Strategy

### Unit Tests (Jest)

```typescript
// __tests__/utils/errors.test.ts
import { handleApiError, ApiError } from '../../src/utils/errors';
import { AxiosError } from 'axios';

describe('handleApiError', () => {
  it('should parse API error response', () => {
    const axiosError = {
      response: {
        status: 400,
        data: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      },
    } as AxiosError;

    const error = handleApiError(axiosError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('INVALID_CREDENTIALS');
    expect(error.status).toBe(400);
  });
});
```

### Component Tests (React Native Testing Library)

```typescript
// __tests__/components/LogEntry.test.tsx
import { render, screen } from '@testing-library/react-native';
import { LogEntry } from '../../src/components/logs/LogEntry';

describe('LogEntry', () => {
  const mockLog: Log = {
    id: '123',
    project_id: 'proj-1',
    level: 'error',
    message: 'Database connection failed',
    timestamp: '2024-01-15T10:30:00Z',
    metadata: { host: 'db-1' },
  };

  it('should render log message', () => {
    render(<LogEntry log={mockLog} />);
    expect(screen.getByText('Database connection failed')).toBeTruthy();
  });

  it('should display error level badge', () => {
    render(<LogEntry log={mockLog} />);
    expect(screen.getByText('error')).toBeTruthy();
  });
});
```

### E2E Tests (Maestro)

```yaml
# .maestro/login.yaml
appId: dev.blazelog.mobile
---
- launchApp
- assertVisible: "Log in to Blazelog"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Log In"
- assertVisible: "Logs" # Bottom tab visible after login
```

```yaml
# .maestro/view-logs.yaml
appId: dev.blazelog.mobile
---
- launchApp
- runFlow: login.yaml
- tapOn: "Logs"
- assertVisible: "Log Viewer"
- tapOn: "Filter"
- tapOn: "Error"
- tapOn: "Apply"
- assertVisible: "error" # At least one error log visible
```

### Running Tests

```bash
# Unit and component tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# E2E tests (requires Maestro CLI)
maestro test .maestro/
```

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 5 requests | per minute per IP |
| Authenticated endpoints | 100 requests | per minute per user |
| SSE streams | 5 concurrent | per user |

### Handling Rate Limits

```typescript
// Retry with exponential backoff on 429
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] ?? '60', 10);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return client(error.config!);
    }
    return Promise.reject(error);
  }
);
```

## Type Generation

Generate TypeScript types from OpenAPI spec:

```bash
npx openapi-typescript ../blazelog/docs/api/openapi.yaml -o src/api/types.ts
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "generate:types": "openapi-typescript ../blazelog/docs/api/openapi.yaml -o src/api/types.ts"
  }
}
```

## Key Features to Implement

1. [x] Architecture documentation
2. [ ] Project scaffolding (Expo init)
3. [ ] Authentication flow (login, token refresh, logout)
4. [ ] Log viewer with filtering & search
5. [ ] Real-time log streaming (SSE)
6. [ ] Alert management (CRUD)
7. [ ] Project switching
8. [ ] Offline support
9. [ ] Push notifications
10. [ ] Deep linking

## Notes

- Backend requires CORS headers for mobile web views (not added yet)
- SSE streaming works via standard HTTP, no WebSocket needed
- React Native doesn't have native EventSource - use `react-native-sse` package
- For SSE with auth headers, may need custom implementation or `@microsoft/fetch-event-source`
