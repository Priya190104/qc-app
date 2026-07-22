'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import authService from '@/lib/auth';
import Sidebar from '@/components/layout/Navbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAuthStore } from '@/stores';
import { useUmuxTrigger } from '@/hooks/useUmuxTrigger';
import { LoadingSpinner } from '@/components/ui';
import { Toaster } from '@/components/ui/Toaster';

// UmuxModal is rarely shown — lazy load to keep initial bundle lean
const UmuxModal = dynamic(() => import('@/components/umux/UmuxModal'), { ssr: false });

interface RootLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Master Layout Component
 * - Handles authentication-based routing
 * - Renders sidebar for protected routes
 * - Manages hydration safety
 * - Mobile: hamburger button + overlay drawer for sidebar
 */
export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { sidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen } = useLayoutStore();
  const { shouldShow: showUmux, dismiss: dismissUmux } = useUmuxTrigger();
  const [showManualUmux, setShowManualUmux] = useState(false);

  // Public routes that don't need sidebar
  const publicRoutes = ['/auth/login', '/'];

  const { setUser } = useAuthStore();

  // Close mobile sidebar on every route change
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [pathname, setSidebarMobileOpen]);

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
    return <LoadingSpinner fullPage size="lg" label="Memuat aplikasi..." />;
  }

  const showSidebar = isAuthenticated && !publicRoutes.includes(pathname);

  return (
    <ErrorBoundary>
      {showSidebar ? (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
          {/* Sidebar — off-canvas on mobile, fixed on desktop */}
          <Sidebar
            onOpenSurvey={() => setShowManualUmux(true)}
            mobileOpen={sidebarMobileOpen}
            onMobileClose={() => setSidebarMobileOpen(false)}
          />

          {/* Mobile overlay backdrop */}
          {sidebarMobileOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              aria-hidden="true"
              onClick={() => setSidebarMobileOpen(false)}
            />
          )}

          {/* Main Content Area - Responsive */}
          <main
            id="main-content"
            tabIndex={-1}
            className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 focus:outline-none ${
              sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
          >
            {/* Mobile top bar: hamburger + brand */}
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarMobileOpen(true)}
                aria-label="Buka navigasi"
                aria-expanded={sidebarMobileOpen}
                aria-controls="sidebar-nav"
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </button>
              <span className="text-sm font-semibold text-gray-800 tracking-wide">QC BERKAS</span>
            </div>

            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>

          {/* UMUX evaluation modal — shown only when all trigger conditions are met */}
          {(showUmux || showManualUmux) && (
            <UmuxModal
              onClose={() => {
                dismissUmux();
                setShowManualUmux(false);
              }}
            />
          )}
        </div>
      ) : (
        // Public routes without sidebar
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-screen bg-gray-50 overflow-x-hidden focus:outline-none"
        >
          {children}
        </main>
      )}
      <Toaster />
    </ErrorBoundary>
  );
}
