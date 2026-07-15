'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/auth';

export default function UmuxResultsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const isAdmin = authService
      .getTokenRoles()
      .some((r) => r.toLowerCase() === 'administrator' || r.toLowerCase() === 'admin');
    if (!isAdmin) router.replace('/dashboard');
  }, [router]);

  return <>{children}</>;
}
