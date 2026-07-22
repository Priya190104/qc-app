import { useState, useCallback } from 'react';
import authService from '@/lib/auth';
import { useAuthStore } from '@/stores';
import { LoginRequest } from '@/types';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setAuthenticated, logout: storeLogout } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authService.login(credentials);
        setUser(response.user);
        setAuthenticated(true);
        return response;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setAuthenticated]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      storeLogout();
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  const checkAuth = useCallback(async () => {
    const isAuth = authService.isAuthenticated();
    setAuthenticated(isAuth);
    return isAuth;
  }, [setAuthenticated]);

  return {
    login,
    logout,
    checkAuth,
    isLoading,
    error,
    setError,
  };
};

export default useAuth;
