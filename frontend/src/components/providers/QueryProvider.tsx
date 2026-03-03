'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * React Query Provider
 *
 * Provides caching and background refetch for all API calls.
 * Wrap the application root with this provider so all pages
 * can use useQuery / useMutation hooks.
 *
 * Default configuration:
 * - staleTime: 30s — data is considered fresh for 30 seconds (no refetch during this window)
 * - gcTime:    5m  — unused cache entries are garbage collected after 5 minutes
 * - retry: 1       — retry failed requests once before showing error
 * - refetchOnWindowFocus: false — don't auto-refetch when user switches tabs
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState so each browser session gets its own QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30 seconds before data is considered stale
            gcTime: 5 * 60_000, // 5 minutes garbage collection time
            retry: 1, // retry once on failure
            refetchOnWindowFocus: false, // don't refetch when switching tabs
          },
          mutations: {
            retry: 0, // don't retry mutations automatically
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
