import { apiClient } from './api';
import { LoginRequest, AuthResponse, ApiResponse } from '@/types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const authData = response.data.data!;
    // Store in localStorage for backward compat (also set as httpOnly cookie by server)
    this.setTokens(authData.accessToken, authData.refreshToken);
    return authData;
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    // Send refresh token in body as fallback; server also reads from cookie
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken: refreshToken ?? undefined,
    });
    const authData = response.data.data!;
    this.setTokens(authData.accessToken, authData.refreshToken);
    return authData.accessToken;
  }

  async logout(): Promise<void> {
    try {
      // Tell server to clear httpOnly cookies
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors during logout — always clear local state
    } finally {
      this.clearTokens();
      apiClient.clearTokens();
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken', accessToken);
      localStorage.setItem(
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken',
        refreshToken
      );
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken');
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Decode JWT payload to extract user roles (no library needed)
   */
  getTokenRoles(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Array.isArray(payload.roles) ? payload.roles : [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();
export default authService;
