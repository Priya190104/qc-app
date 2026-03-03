/**
 * React Query Hooks
 * =================
 * Centralized API hooks with automatic caching, deduplication,
 * and background refetch using @tanstack/react-query.
 *
 * Usage in components:
 *
 *   // Instead of manually calling useEffect + useState:
 *   const { data, isLoading, error } = useDashboardMetrics();
 *   const { data, isLoading, error } = useBerkasList({ page: 1, limit: 10 });
 *
 * Benefits over plain useEffect:
 * - Automatic caching (same params = cached result, no extra request)
 * - Request deduplication (multiple components requesting same data = 1 request)
 * - Background refetch when data becomes stale
 * - Built-in loading/error states
 * - Automatic retry on failure
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// ====================================================================
// QUERY KEYS — centralized to enable targeted cache invalidation
// ====================================================================
export const queryKeys = {
  dashboard: {
    metrics: (dateFrom?: string, dateTo?: string) =>
      ['dashboard', 'metrics', dateFrom, dateTo] as const,
    petugasStats: () => ['dashboard', 'petugasStats'] as const,
    activities: (page: number) => ['dashboard', 'activities', page] as const,
  },
  berkas: {
    list: (filters: Record<string, any>) => ['berkas', 'list', filters] as const,
    detail: (id: string) => ['berkas', 'detail', id] as const,
    history: (id: string) => ['berkas', 'history', id] as const,
    byStatus: (status: string) => ['berkas', 'byStatus', status] as const,
  },
  petugas: {
    list: () => ['petugas', 'list'] as const,
    detail: (id: string) => ['petugas', 'detail', id] as const,
  },
  users: {
    list: () => ['users', 'list'] as const,
  },
};

// ====================================================================
// DASHBOARD HOOKS
// ====================================================================

export function useDashboardMetrics(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics(dateFrom, dateTo),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      const url = params.toString() ? `/dashboard/metrics?${params}` : '/dashboard/metrics';
      const res = await apiClient.get<any>(url);
      return res.data?.data;
    },
    staleTime: 30_000, // Dashboard metrics: 30 seconds
  });
}

export function useDashboardPetugasStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.petugasStats(),
    queryFn: async () => {
      const res = await apiClient.get<any>('/dashboard/petugas-stats');
      return res.data?.data;
    },
    staleTime: 60_000, // Petugas stats: 60 seconds
  });
}

// ====================================================================
// BERKAS HOOKS
// ====================================================================

interface BerkasListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  desa?: string;
  kecamatan?: string;
  tahunBerkas?: number;
  includeClosed?: boolean;
}

export function useBerkasList(filters: BerkasListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.berkas.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const res = await apiClient.get<any>(`/berkas?${params}`);
      return res.data?.data;
    },
    staleTime: 15_000, // Berkas list: 15 seconds
    placeholderData: (prev) => prev, // Keep previous data while refetching (no flash)
  });
}

export function useBerkasDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.berkas.detail(id),
    queryFn: async () => {
      const res = await apiClient.get<any>(`/berkas/${id}`);
      return res.data?.data;
    },
    enabled: !!id, // Only fetch when id is provided
    staleTime: 10_000,
  });
}

export function useBerkasHistory(berkasId: string) {
  return useQuery({
    queryKey: queryKeys.berkas.history(berkasId),
    queryFn: async () => {
      const res = await apiClient.get<any>(`/berkas/workflow/${berkasId}/history`);
      return res.data?.data ?? [];
    },
    enabled: !!berkasId,
    staleTime: 10_000,
  });
}

// ====================================================================
// PETUGAS HOOKS
// ====================================================================

export function usePetugasList() {
  return useQuery({
    queryKey: queryKeys.petugas.list(),
    queryFn: async () => {
      const res = await apiClient.get<any>('/petugas');
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60_000, // Petugas list rarely changes: 5 minutes
  });
}

// ====================================================================
// CACHE INVALIDATION HELPERS
// ====================================================================

/**
 * Hook to manually invalidate caches after mutations.
 * Call these after creating/updating/deleting berkas.
 *
 * Example:
 *   const { invalidateBerkas } = useCacheInvalidation();
 *   await createBerkas(data);
 *   invalidateBerkas();
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidateBerkas: () => queryClient.invalidateQueries({ queryKey: ['berkas'] }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
