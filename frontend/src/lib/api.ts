import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, ApiResponse } from '@/types';
import { emitUmuxCheckNeeded } from '@/lib/umux-events';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class APIClient {
  private instance: AxiosInstance;
  private refreshing = false;
  private failedQueue: any[] = [];

  // Tracks active AbortControllers keyed by a request identifier
  // so callers can cancel in-flight requests (e.g. on component unmount)
  private abortControllers = new Map<string, AbortController>();

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // withCredentials: true allows the browser to send httpOnly cookies
      // along with every cross-origin request. This enables the httpOnly
      // cookie-based auth flow while keeping Bearer token as a fallback.
      withCredentials: true,
    });

    // Request interceptor — attach Bearer token from localStorage if present
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — handle 401 / token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse<null>>) => {
        const originalRequest = error.config as any;

        // Abort errors (e.g. AbortController.abort()) — don't retry
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't try to refresh for auth endpoints themselves
          const requestUrl: string = originalRequest.url || '';
          if (requestUrl.includes('/auth/')) {
            return Promise.reject(error);
          }

          if (this.refreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() =>
                this.instance({ ...originalRequest, responseType: originalRequest.responseType })
              )
              .catch(() => Promise.reject(error));
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Use a plain axios instance for the refresh request so it never
            // inherits binary responseType from the original request config.
            const response = await this.instance.post(
              '/auth/refresh',
              {
                refreshToken,
              },
              { responseType: 'json' }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data
              .data as AuthResponse;
            this.setTokens(accessToken, newRefreshToken);

            // Notify UMUX trigger hook that a token refresh occurred.
            // The hook will check whether the user owes a survey this month.
            emitUmuxCheckNeeded();

            // Explicitly spread to preserve responseType on each queued retry.
            this.failedQueue.forEach(({ resolve }) =>
              resolve(
                this.instance({ ...originalRequest, responseType: originalRequest.responseType })
              )
            );
            this.failedQueue = [];

            return this.instance({
              ...originalRequest,
              responseType: originalRequest.responseType,
            });
          } catch (err) {
            this.failedQueue = [];
            this.clearTokens();
            window.location.href = '/auth/login';
            return Promise.reject(err);
          } finally {
            this.refreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ──────────────────────────────────────────────────────────────
  // AbortController helpers
  // ──────────────────────────────────────────────────────────────

  /**
   * Create a new AbortController for a named request.
   * If a previous controller with the same key exists it is aborted first,
   * preventing duplicate concurrent requests (e.g. fast navigation / rapid filter changes).
   *
   * Usage in React:
   *   useEffect(() => {
   *     const { signal, cancel } = apiClient.createAbortSignal('berkas-list');
   *     apiClient.get('/berkas', { signal });
   *     return cancel; // auto-cancel on unmount
   *   }, []);
   */
  createAbortSignal(key: string): { signal: AbortSignal; cancel: () => void } {
    // Cancel any previous request with the same key
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key)!.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    const cancel = () => {
      controller.abort();
      this.abortControllers.delete(key);
    };

    return { signal: controller.signal, cancel };
  }

  /**
   * Cancel a previously created abort signal by key.
   */
  cancelRequest(key: string) {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key)!.abort();
      this.abortControllers.delete(key);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Token Management (localStorage — kept for backward compat)
  // ──────────────────────────────────────────────────────────────

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken', accessToken);
      localStorage.setItem(
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken',
        refreshToken
      );
    }
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken');
    }
    return null;
  }

  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken');
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Axios Instance (for advanced usage)
  // ──────────────────────────────────────────────────────────────

  public getClient(): AxiosInstance {
    return this.instance;
  }

  // ──────────────────────────────────────────────────────────────
  // Generic Methods — all accept optional AbortSignal via config
  // ──────────────────────────────────────────────────────────────

  async get<T>(url: string, config?: any) {
    return this.instance.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.instance.post<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.instance.patch<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.instance.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any) {
    return this.instance.delete<T>(url, config);
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
