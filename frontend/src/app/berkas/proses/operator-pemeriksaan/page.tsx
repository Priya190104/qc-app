'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperatorPemeriksaanPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/berkas/proses');
  }, [router]);
  return null;
}
