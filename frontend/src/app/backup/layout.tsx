'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/auth';

/**
 * Backup layout — hanya bisa diakses oleh Administrator.
 * User non-admin diarahkan ke /dashboard.
 */
export default function BackupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const roles = authService.getTokenRoles().map((r) => r.toLowerCase().trim());
    const isAdmin = roles.some((r) => r === 'administrator' || r === 'admin');
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [router]);

  return <>{children}</>;
}
