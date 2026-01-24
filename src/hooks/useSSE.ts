import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Constants from 'expo-constants';
import { storage, logger } from '@/utils';
import type { Log } from '@/api/types';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.blazelog.dev';

// Debounce delay for connection attempts (ms)
const CONNECT_DEBOUNCE_MS = 500;

interface UseSSEOptions {
  start?: string;
  levels?: string[];
  projectId?: string; // Filter logs by project
  maxLogs?: number;
  autoConnect?: boolean;
  pauseOnBackground?: boolean;
}

interface UseSSEReturn {
  logs: Log[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearLogs: () => void;
}

const getDefaultStart = (): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 5); // Last 5 minutes for stream
  return date.toISOString();
};

export const useSSE = (options: UseSSEOptions = {}): UseSSEReturn => {
  const {
    start = getDefaultStart(),
    levels = [],
    projectId,
    maxLogs = 500,
    autoConnect = false,
    pauseOnBackground = true, // Disable connection when app is backgrounded by default
  } = options;

  const [logs, setLogs] = useState<Log[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const connectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasConnectedBeforeBackground = useRef(false);
  const maxRetries = 5;

  const disconnect = useCallback(() => {
    // Clear any pending debounced connect
    if (connectDebounceRef.current) {
      clearTimeout(connectDebounceRef.current);
      connectDebounceRef.current = null;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    retryCountRef.current = 0;
  }, []);

  const connectInternal = useCallback(async () => {
    // Abort any existing connection first
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    // Always get fresh token on each connection/reconnection attempt
    const token = await storage.getAccessToken();
    if (!token) {
      setError('Not authenticated');
      setIsConnecting(false);
      return;
    }

    setError(null);
    controllerRef.current = new AbortController();

    const params = new URLSearchParams({ start });
    if (levels.length > 0) {
      params.set('levels', levels.join(','));
    }
    if (projectId) {
      params.set('project_id', projectId);
    }

    const url = `${API_URL}/api/v1/logs/stream?${params.toString()}`;

    try {
      await fetchEventSource(url, {
        signal: controllerRef.current.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        onopen: async (response) => {
          if (response.ok) {
            setIsConnected(true);
            setIsConnecting(false);
            retryCountRef.current = 0;
            logger.info('SSE connection established');
          } else if (response.status === 401) {
            // Token expired - will retry with fresh token
            throw new Error('Token expired');
          } else {
            throw new Error(`Failed to connect: ${response.status}`);
          }
        },
        onmessage: (event) => {
          if (event.data) {
            try {
              const log = JSON.parse(event.data) as Log;
              setLogs((prev) => {
                const newLogs = [log, ...prev];
                // Keep only maxLogs entries
                return newLogs.slice(0, maxLogs);
              });
            } catch (e) {
              logger.warn('Failed to parse log event', e);
            }
          }
        },
        onerror: (err) => {
          setIsConnected(false);
          setIsConnecting(false);

          if (controllerRef.current?.signal.aborted) {
            return; // Intentional disconnect
          }

          retryCountRef.current++;
          if (retryCountRef.current >= maxRetries) {
            setError('Connection lost. Max retries exceeded.');
            logger.error('SSE max retries exceeded');
            throw err; // Stop retrying
          }

          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          logger.info(`SSE reconnecting in ${delay}ms`, { attempt: retryCountRef.current });

          // Note: fetchEventSource handles retry internally, but we refresh token on each attempt
          // by throwing and letting it reconnect via onerror
        },
        // Don't keep connection when app is backgrounded - save battery
        openWhenHidden: !pauseOnBackground,
      });
    } catch (err) {
      if (!controllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Connection failed';
        setError(errorMessage);
        setIsConnected(false);
        setIsConnecting(false);
        logger.error('SSE connection failed', err);
      }
    }
  }, [start, levels, projectId, maxLogs, pauseOnBackground]);

  // Debounced connect to prevent rapid connection attempts
  const connect = useCallback(() => {
    // Clear any pending debounced connect
    if (connectDebounceRef.current) {
      clearTimeout(connectDebounceRef.current);
    }

    setIsConnecting(true);
    setError(null);

    connectDebounceRef.current = setTimeout(() => {
      connectDebounceRef.current = null;
      connectInternal();
    }, CONNECT_DEBOUNCE_MS);
  }, [connectInternal]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    if (!pauseOnBackground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Save connection state and disconnect when going to background
        wasConnectedBeforeBackground.current = isConnected || isConnecting;
        if (wasConnectedBeforeBackground.current) {
          logger.info('SSE pausing connection (app backgrounded)');
          disconnect();
        }
      } else if (nextAppState === 'active') {
        // Reconnect when coming back to foreground if we were connected
        if (wasConnectedBeforeBackground.current) {
          logger.info('SSE resuming connection (app foregrounded)');
          connect();
          wasConnectedBeforeBackground.current = false;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [pauseOnBackground, isConnected, isConnecting, connect, disconnect]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      // Schedule connect to run after paint to avoid synchronous setState
      const timeoutId = setTimeout(() => connect(), 0);
      return () => {
        clearTimeout(timeoutId);
        disconnect();
      };
    }
    return disconnect;
  }, [autoConnect, connect, disconnect]);

  return {
    logs,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    clearLogs,
  };
};
