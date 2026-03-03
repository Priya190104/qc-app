'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BerkasPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/berkas/all');
  }, [router]);

  return null;
}
