'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/auth';

/**
 * Protected Route Layout
 * Ensures only authenticated users can access
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Guard: redirect if not authenticated
    const isAuthenticated = authService.isAuthenticated();
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [router]);

  return <>{children}</>;
}
