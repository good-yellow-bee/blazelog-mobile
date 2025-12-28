import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { logsApi } from '@/api';
import { MAX_PAGES_IN_MEMORY } from '@/utils';
import type { LogFilters, LogsResponse, Log, LogStatsParams } from '@/api/types';

// Default time range: last 24 hours
const getDefaultStart = (): string => {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date.toISOString();
};

export const useLogsQuery = (filters: Partial<LogFilters> = {}) => {
  const queryFilters: LogFilters = {
    start: filters.start || getDefaultStart(),
    ...filters,
    per_page: filters.per_page || 50,
  };

  return useInfiniteQuery({
    queryKey: ['logs', queryFilters],
    queryFn: async ({ pageParam = 1 }) => {
      return logsApi.getLogs({
        ...queryFilters,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // Limit maximum pages in memory to prevent OOM
      if (allPages.length >= MAX_PAGES_IN_MEMORY) {
        return undefined;
      }
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    // Limit max pages stored in query data
    maxPages: MAX_PAGES_IN_MEMORY,
  });
};

export const useLogQuery = (logId: string, enabled = true) => {
  return useQuery({
    queryKey: ['log', logId],
    queryFn: () => logsApi.getLog(logId),
    enabled,
  });
};

export const useLogStatsQuery = (params: LogStatsParams) => {
  return useQuery({
    queryKey: ['logStats', params],
    queryFn: () => logsApi.getLogStats(params),
  });
};

// Helper to flatten paginated logs with memory-efficient processing
export const flattenLogs = (pages: LogsResponse[] | undefined): Log[] => {
  if (!pages) return [];
  // Only flatten visible pages to prevent memory bloat
  return pages.flatMap((page) => page.items);
};

// Calculate total logs count from pagination metadata
export const getTotalLogsCount = (pages: LogsResponse[] | undefined): number => {
  if (!pages || pages.length === 0) return 0;
  return pages[0].total;
};
