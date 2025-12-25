import Constants from 'expo-constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

// Only enable logging in development
const isDevelopment = Constants.expoConfig?.extra?.environment !== 'production';

// In-memory log buffer for debugging (limited size)
const LOG_BUFFER_SIZE = 100;
const logBuffer: LogEntry[] = [];

const addToBuffer = (entry: LogEntry) => {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
};

const formatMessage = (level: LogLevel, message: string, data?: unknown): string => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
};

/**
 * Secure logger that only outputs in development mode
 * Prevents sensitive data from leaking to device logs in production
 */
export const logger = {
  debug(message: string, data?: unknown): void {
    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    addToBuffer(entry);

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', message, data));
    }
  },

  info(message: string, data?: unknown): void {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    addToBuffer(entry);

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(formatMessage('info', message, data));
    }
  },

  warn(message: string, data?: unknown): void {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    addToBuffer(entry);

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage('warn', message, data));
    }
  },

  error(message: string, error?: unknown): void {
    // Sanitize error to avoid leaking sensitive data
    const sanitizedError =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : typeof error === 'string'
          ? error
          : undefined;

    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      data: sanitizedError,
    };
    addToBuffer(entry);

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(formatMessage('error', message, sanitizedError));
    }
  },

  /**
   * Get recent logs for debugging (only available in development)
   */
  getRecentLogs(): LogEntry[] {
    if (!isDevelopment) return [];
    return [...logBuffer];
  },

  /**
   * Clear the log buffer
   */
  clearLogs(): void {
    logBuffer.length = 0;
  },
};
