'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated();
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [router]);

  return <>{children}</>;
}
