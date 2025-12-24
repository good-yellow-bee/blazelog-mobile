import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Constants from 'expo-constants';
import { storage } from '@/utils';
import type { Log } from '@/api/types';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.blazelog.dev';

interface UseSSEOptions {
  start?: string;
  levels?: string[];
  maxLogs?: number;
  autoConnect?: boolean;
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
    maxLogs = 500,
    autoConnect = false,
  } = options;

  const [logs, setLogs] = useState<Log[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  const disconnect = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    retryCountRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    disconnect();

    const token = await storage.getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setIsConnecting(true);
    setError(null);
    controllerRef.current = new AbortController();

    const params = new URLSearchParams({ start });
    if (levels.length > 0) {
      params.set('levels', levels.join(','));
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
              console.warn('Failed to parse log event:', e);
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
            throw err; // Stop retrying
          }

          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          console.log(`SSE reconnecting in ${delay}ms (attempt ${retryCountRef.current})`);
        },
        openWhenHidden: true, // Keep connection when app is backgrounded
      });
    } catch (err) {
      if (!controllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsConnected(false);
        setIsConnecting(false);
      }
    }
  }, [start, levels, maxLogs, disconnect]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
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
