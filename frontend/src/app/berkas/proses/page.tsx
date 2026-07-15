'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader, SectionLoader } from '@/components/ui';
import authService from '@/lib/auth';
import {
  Clipboard,
  Ruler,
  Map,
  Users,
  Briefcase,
  Compass,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface RoleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
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
  'operator-data-pemetaan': '/berkas/proses/operator-data-pemetaan',
  'operator-data-ukur': '/berkas/proses/operator-data-ukur',
  'operator-data-berkas': '/berkas/proses/operator-data-berkas',
};

const ADMIN_ROLES = ['administrator', 'admin'];

const roleCards: RoleCard[] = [
  {
    id: 'operator-data-berkas',
    title: 'Operator Data Berkas',
    description: 'Input dan kelola data berkas masuk',
    icon: Clipboard,
    href: '/berkas/proses/operator-data-berkas',
  },
  {
    id: 'operator-data-ukur',
    title: 'Operator Data Ukur',
    description: 'Kelola dan rekam data pengukuran lapangan',
    icon: Ruler,
    href: '/berkas/proses/operator-data-ukur',
  },
  {
    id: 'operator-data-pemetaan',
    title: 'Operator Data Pemetaan',
    description: 'Kelola data dan koordinat pemetaan',
    icon: Map,
    href: '/berkas/proses/operator-data-pemetaan',
  },
  {
    id: 'kks',
    title: 'KKS',
    description: 'Koordinator Kelompok Substansi — penunjukan petugas',
    icon: Users,
    href: '/berkas/proses/kks',
  },
  {
    id: 'kepala-seksi',
    title: 'Kepala Seksi',
    description: 'Persetujuan dan tanda tangan kepala seksi',
    icon: Briefcase,
    href: '/berkas/proses/kepala-seksi',
  },
  {
    id: 'petugas-ukur',
    title: 'Petugas Ukur',
    description: 'Verifikasi dan unggah hasil pengukuran',
    icon: Compass,
    href: '/berkas/proses/petugas-ukur',
  },
  {
    id: 'petugas-pemetaan',
    title: 'Petugas Pemetaan',
    description: 'Verifikasi dan unggah hasil pemetaan',
    icon: MapPin,
    href: '/berkas/proses/petugas-pemetaan',
  },
];

export default function ProsesBerkasPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [userRoleHrefs, setUserRoleHrefs] = useState<string[] | null>(null);

  useEffect(() => {
    const roles = authService.getTokenRoles();
    const normalized = roles.map((r) => r.toLowerCase().trim());
    const isAdmin = normalized.some((r) => ADMIN_ROLES.includes(r));

    if (!isAdmin) {
      const matchedHrefs = [...new Set(normalized.map((r) => ROLE_HREF_MAP[r]).filter(Boolean))];

      if (matchedHrefs.length === 1) {
        router.replace(matchedHrefs[0]);
        return;
      }

      setUserRoleHrefs(matchedHrefs);
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <SectionLoader />;
  }

  const visibleCards =
    userRoleHrefs === null ? roleCards : roleCards.filter((c) => userRoleHrefs.includes(c.href));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berkas Dalam Proses"
        description="Pilih peran untuk melihat dan mengelola berkas yang sedang diproses"
        breadcrumbs={[{ label: 'Berkas' }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="group flex flex-col bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-snug">{card.title}</h3>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed flex-grow">
                {card.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
                <span>Lihat berkas</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
