'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import authService from '@/lib/auth';

interface RoleCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

/** Map role name (case-insensitive) to proses href */
const ROLE_HREF_MAP: Record<string, string> = {
  'kepala-seksi': '/berkas/proses/kepala-seksi',
  kks: '/berkas/proses/kks',
  'petugas-pemetaan': '/berkas/proses/petugas-pemetaan',
  'petugas-ukur': '/berkas/proses/petugas-ukur',
  'operator data pemetaan': '/berkas/proses/operator-data-pemetaan',
  'operator data ukur': '/berkas/proses/operator-data-ukur',
  'operator data berkas': '/berkas/proses/operator-data-berkas',
  // normalised hyphenated variants (in case stored differently)
  'operator-data-pemetaan': '/berkas/proses/operator-data-pemetaan',
  'operator-data-ukur': '/berkas/proses/operator-data-ukur',
  'operator-data-berkas': '/berkas/proses/operator-data-berkas',
};

const ADMIN_ROLES = ['administrator', 'admin'];

export default function ProsesBerkasPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  // null = admin (tampilkan semua card), array = hanya tampilkan card role yang dimiliki
  const [userRoleHrefs, setUserRoleHrefs] = useState<string[] | null>(null);

  useEffect(() => {
    const roles = authService.getTokenRoles();
    const normalized = roles.map((r) => r.toLowerCase().trim());
    const isAdmin = normalized.some((r) => ADMIN_ROLES.includes(r));

    if (!isAdmin) {
      // Kumpulkan semua href yang cocok dengan role user (deduplikasi)
      const matchedHrefs = [...new Set(normalized.map((r) => ROLE_HREF_MAP[r]).filter(Boolean))];

      if (matchedHrefs.length === 1) {
        // Hanya 1 role yang cocok → langsung redirect
        router.replace(matchedHrefs[0]);
        return;
      }

      // Lebih dari 1 role → simpan agar hanya card yang relevan yang ditampilkan
      setUserRoleHrefs(matchedHrefs);
    }
    // Admin: userRoleHrefs tetap null (tampilkan semua card)
    setChecked(true);
  }, [router]);
  const roleCards: RoleCard[] = [
    {
      id: 'operator-data-berkas',
      title: 'Operator Data Berkas',
      description: 'Kelola data berkas dan dokumentasi',
      icon: '📋',
      href: '/berkas/proses/operator-data-berkas',
      color: 'blue',
    },
    {
      id: 'operator-data-ukur',
      title: 'Operator Data Ukur',
      description: 'Kelola data pengukuran',
      icon: '📏',
      href: '/berkas/proses/operator-data-ukur',
      color: 'cyan',
    },
    {
      id: 'operator-data-pemetaan',
      title: 'Operator Data Pemetaan',
      description: 'Kelola data pemetaan',
      icon: '🗺️',
      href: '/berkas/proses/operator-data-pemetaan',
      color: 'green',
    },
    {
      id: 'operator-pemeriksaan',
      title: 'Operator Pemeriksaan',
      description: 'Kelola pemeriksaan berkas',
      icon: '🔍',
      href: '/berkas/proses/operator-pemeriksaan',
      color: 'indigo',
    },
    {
      id: 'petugas-ukur',
      title: 'Petugas Ukur',
      description: 'Verifikasi pengukuran data',
      icon: '✓📏',
      href: '/berkas/proses/petugas-ukur',
      color: 'purple',
    },
    {
      id: 'petugas-pemetaan',
      title: 'Petugas Pemetaan',
      description: 'Verifikasi data pemetaan',
      icon: '✓🗺️',
      href: '/berkas/proses/petugas-pemetaan',
      color: 'pink',
    },
    {
      id: 'kks',
      title: 'KKS',
      description: 'Koordinator Kelompok Substansi',
      icon: '🎯',
      href: '/berkas/proses/kks',
      color: 'yellow',
    },
    {
      id: 'kepala-seksi',
      title: 'Kepala Seksi',
      description: 'Persetujuan final kepala seksi',
      icon: '👔',
      href: '/berkas/proses/kepala-seksi',
      color: 'red',
    },
  ];

  const getCardBgColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      cyan: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
      green: 'bg-green-50 hover:bg-green-100 border-green-200',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
      red: 'bg-red-50 hover:bg-red-100 border-red-200',
    };
    return colors[color] || 'bg-gray-50 hover:bg-gray-100 border-gray-200';
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'text-blue-600',
      cyan: 'text-cyan-600',
      indigo: 'text-indigo-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
    };
    return colors[color] || 'text-gray-600';
  };

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-3">⌛</div>
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // Admin tampilkan semua card; non-admin dengan multi-role tampilkan hanya card yang dimiliki
  const visibleCards =
    userRoleHrefs === null ? roleCards : roleCards.filter((c) => userRoleHrefs.includes(c.href));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">⏱️ Berkas Dalam Proses</h1>
        <p className="text-gray-600 mt-1">Pilih peran untuk melihat berkas yang sesuai</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleCards.map((card) => (
          <Link key={card.id} href={card.href}>
            <Card
              className={`h-64 p-6 cursor-pointer border-2 transition-all flex flex-col ${getCardBgColor(card.color)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-4xl ${getIconColor(card.color)}`}>{card.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-600 mt-2 flex-grow">{card.description}</p>
              <div className="flex items-center text-sm font-medium text-gray-700">
                Lihat Berkas →
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
