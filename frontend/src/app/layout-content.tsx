'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import authService from '@/lib/auth';
import Sidebar from '@/components/layout/Navbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAuthStore } from '@/stores';

interface RootLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Master Layout Component
 * - Handles authentication-based routing
 * - Renders sidebar for protected routes
 * - Manages hydration safety
 */
export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { sidebarCollapsed } = useLayoutStore();

  // Public routes that don't need sidebar
  const publicRoutes = ['/auth/login', '/auth/register', '/'];

  const { setUser } = useAuthStore();

  useEffect(() => {
    // Re-check on every route change so login/logout is reflected immediately
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);

    // Fetch /auth/me to restore full user info (including roles) regardless of token age
    if (isAuth) {
      import('@/lib/api').then(({ apiClient }) => {
        apiClient
          .get<any>('/auth/me')
          .then((res) => {
            const u = res.data?.data ?? res.data;
            if (u?.id) {
              setUser({
                id: u.id,
                email: u.email ?? '',
                firstName: u.firstName ?? '',
                lastName: u.lastName ?? '',
                isActive: true,
                createdAt: '',
                updatedAt: '',
                roles: Array.isArray(u.roles)
                  ? u.roles.map((r: any) => (typeof r === 'string' ? { id: '', name: r } : r))
                  : [],
              });
            }
          })
          .catch(() => {
            // Fallback: decode header if API call fails (e.g. during token refresh)
            try {
              const token = localStorage.getItem(
                process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY || 'accessToken'
              );
              if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.sub) {
                  setUser({
                    id: payload.sub,
                    email: payload.email ?? '',
                    firstName: payload.firstName ?? '',
                    lastName: payload.lastName ?? '',
                    isActive: true,
                    createdAt: '',
                    updatedAt: '',
                    roles: Array.isArray(payload.roles)
                      ? payload.roles.map((r: string) => ({ id: '', name: r }))
                      : [],
                  });
                }
              }
            } catch {
              // ignore
            }
          });
      });
    }
  }, [pathname]);

  // Prevent hydration mismatch by waiting for client-side check
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  const showSidebar = isAuthenticated && !publicRoutes.includes(pathname);

  return (
    <ErrorBoundary>
      {showSidebar ? (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area - Responsive */}
          <main
            className={`flex-1 transition-all duration-300 p-8 overflow-x-hidden ${
              sidebarCollapsed ? 'ml-20' : 'ml-64'
            }`}
          >
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      ) : (
        // Public routes without sidebar
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">{children}</div>
      )}
    </ErrorBoundary>
  );
}
