import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys that contain sensitive data and should be stored encrypted
const SENSITIVE_QUERY_PREFIXES = ['users', 'user', 'log', 'logs', 'alert', 'alerts'];

// Maximum size for SecureStore (2KB limit on some platforms)
const SECURE_STORE_MAX_SIZE = 2048;

// Storage key prefixes
const SECURE_PREFIX = 'blazelog-secure-cache:';
const ASYNC_PREFIX = 'blazelog-cache:';

/**
 * Determines if a query key contains sensitive data
 */
const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_QUERY_PREFIXES.some((prefix) => lowerKey.includes(prefix));
};

/**
 * Chunks large data for SecureStore which has size limits
 */
const chunkData = (data: string, chunkSize: number): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Secure storage adapter that encrypts sensitive query data
 * Falls back to AsyncStorage for non-sensitive or large data
 */
export const secureQueryStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Try secure storage first for sensitive keys
      if (isSensitiveKey(key)) {
        // Check for chunked data
        const chunkCountStr = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}:chunks`);
        if (chunkCountStr) {
          const chunkCount = parseInt(chunkCountStr, 10);
          const chunks: string[] = [];
          for (let i = 0; i < chunkCount; i++) {
            const chunk = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}:${i}`);
            if (chunk) chunks.push(chunk);
          }
          return chunks.join('');
        }

        // Try single value
        const secureValue = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}`);
        if (secureValue) return secureValue;
      }

      // Fall back to AsyncStorage
      return await AsyncStorage.getItem(`${ASYNC_PREFIX}${key}`);
    } catch {
      // If secure storage fails, try AsyncStorage
      return await AsyncStorage.getItem(`${ASYNC_PREFIX}${key}`);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSensitiveKey(key)) {
        // For sensitive data, try SecureStore
        if (value.length <= SECURE_STORE_MAX_SIZE) {
          await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}`, value);
          return;
        }

        // Chunk large sensitive data
        const chunks = chunkData(value, SECURE_STORE_MAX_SIZE);
        await SecureStore.setItemAsync(`${SECURE_PREFIX}${key}:chunks`, String(chunks.length));
        await Promise.all(
          chunks.map((chunk, i) => SecureStore.setItemAsync(`${SECURE_PREFIX}${key}:${i}`, chunk))
        );
        return;
      }

      // Non-sensitive data goes to AsyncStorage
      await AsyncStorage.setItem(`${ASYNC_PREFIX}${key}`, value);
    } catch {
      // Fall back to AsyncStorage if SecureStore fails (e.g., web platform)
      await AsyncStorage.setItem(`${ASYNC_PREFIX}${key}`, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // Remove from both storages to be safe
      if (isSensitiveKey(key)) {
        // Check for chunked data
        const chunkCountStr = await SecureStore.getItemAsync(`${SECURE_PREFIX}${key}:chunks`);
        if (chunkCountStr) {
          const chunkCount = parseInt(chunkCountStr, 10);
          await Promise.all([
            SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}:chunks`),
            ...Array.from({ length: chunkCount }, (_, i) =>
              SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}:${i}`)
            ),
          ]);
        } else {
          await SecureStore.deleteItemAsync(`${SECURE_PREFIX}${key}`);
        }
      }

      await AsyncStorage.removeItem(`${ASYNC_PREFIX}${key}`);
    } catch {
      // Silently handle errors during cleanup
    }
  },
};

/**
 * Clear all cached query data from both storages
 */
export const clearAllQueryCache = async (): Promise<void> => {
  try {
    // Clear AsyncStorage cache keys
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(ASYNC_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }

    // Note: SecureStore doesn't support listing keys, so we can't clear all
    // The cache will be overwritten on next use
  } catch {
    // Handle errors silently
  }
};
