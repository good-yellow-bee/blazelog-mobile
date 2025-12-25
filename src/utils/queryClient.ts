import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { secureQueryStorage } from './secureQueryStorage';

// Maximum number of pages to keep in memory for infinite queries
const MAX_PAGES_IN_MEMORY = 10;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 4 * 60 * 60 * 1000, // 4 hours (reduced from 24 for security)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst', // Serve from cache when offline
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Use secure storage adapter that encrypts sensitive data
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: secureQueryStorage,
  key: 'blazelog-query-cache',
  throttleTime: 1000,
  // Only persist non-stale data
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
});

// Export max pages constant for use in infinite queries
export { MAX_PAGES_IN_MEMORY };
