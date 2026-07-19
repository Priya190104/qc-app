'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Pagination, PageHeader } from '@/components/ui';
import { StatusBadge, TableSkeleton, EmptyState, TabBar } from '@/components/berkas';
import BerkasFilter, { BerkasFilterValues } from '@/components/filters/BerkasFilter';
import { useBerkasList } from '@/hooks/useQueryHooks';

interface Berkas {
  id: string;
  nomor: string;
  namaPemohon?: string;
  tanggalBerkas?: string;
  kegiatan?: string;
  desa?: string;
  kecamatan?: string;
  deskripsi?: string;
  status: string;
  petugasId?: string;
  petugasPemetaanId?: string;
  petugasPemetaan?: {
    id: string;
    nama: string;
    nip: string;
  };
  revisionCount: number;
  lastRevisionFrom?: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'proses' | 'revisi';

const COLS = 9;

const TABS = [
  { key: 'proses', label: 'Dalam Proses' },
  { key: 'revisi', label: 'Perlu Revisi' },
];

export default function PetugasPemetaanPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BerkasFilterValues>({});
  const [activeTab, setActiveTab] = useState<TabType>('proses');
  const itemsPerPage = 10;

  const tabStatus = activeTab === 'proses' ? 'DI_PETUGAS_PEMETAAN' : 'REVISI_KKS,REVISI_KASI';
  const { data, isLoading, error } = useBerkasList({
    status: tabStatus,
    page: currentPage,
    limit: itemsPerPage,
    ...(activeTab === 'revisi' ? { revisionTarget: 'PETUGAS_PEMETAAN' } : {}),
    ...filters,
  });

  const berkasList: Berkas[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalItems = data?.pagination?.total ?? 0;

  const handleFilterChange = (newFilters: BerkasFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Petugas Pemetaan"
        description="Daftar berkas yang perlu diverifikasi dan diunggah hasil pemetaannya"
        breadcrumbs={[
          { label: 'Berkas Dalam Proses', href: '/berkas/proses' },
          { label: 'Petugas Pemetaan' },
        ]}
      />

      {error && (
        <Alert
          type="error"
          title="Gagal memuat data"
          message={(error as Error)?.message ?? 'Gagal memuat data'}
        />
      )}

      <BerkasFilter onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <TabBar
          tabs={TABS.map((t) => ({
            ...t,
            count: activeTab === t.key ? totalItems : undefined,
          }))}
          activeTab={activeTab}
          onTabChange={(key) => handleTabChange(key as TabType)}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-10">
                  No.
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  No. Berkas
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Pemohon
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Tgl. Masuk
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Kegiatan
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Desa / Kecamatan
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Petugas Pemetaan
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <TableSkeleton cols={COLS} />
              ) : berkasList.length === 0 ? (
                <EmptyState
                  cols={COLS}
                  title={
                    activeTab === 'proses'
                      ? 'Tidak ada berkas dalam proses'
                      : 'Tidak ada berkas yang perlu direvisi'
                  }
                  description={
                    activeTab === 'proses'
                      ? 'Berkas dengan status Di Petugas Pemetaan akan muncul di sini.'
                      : 'Berkas yang dikembalikan untuk revisi akan muncul di sini.'
                  }
                />
              ) : (
                berkasList.map((berkas, index) => (
                  <tr
                    key={berkas.id}
                    className="hover:bg-blue-50/40 transition-colors duration-100"
                  >
                    <td className="px-3 py-2.5 text-xs text-gray-500 tabular-nums">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-xs font-semibold text-gray-900 truncate block max-w-[120px]"
                        title={berkas.nomor}
                      >
                        {berkas.nomor}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-xs text-gray-700 truncate block max-w-[140px]"
                        title={berkas.namaPemohon || '-'}
                      >
                        {berkas.namaPemohon || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                      {berkas.tanggalBerkas
                        ? new Date(berkas.tanggalBerkas).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-xs text-gray-700 truncate block max-w-[130px]"
                        title={berkas.kegiatan || '-'}
                      >
                        {berkas.kegiatan || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block text-xs font-medium text-gray-800">
                        {berkas.desa || '-'}
                      </span>
                      <span className="block text-[11px] text-gray-500">
                        {berkas.kecamatan || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {berkas.petugasPemetaan ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-800">
                            {berkas.petugasPemetaan.nama}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {berkas.petugasPemetaan.nip}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={berkas.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link href={`/berkas/proses/petugas-pemetaan/${berkas.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2.5 py-1 text-blue-600 hover:bg-blue-50 border-blue-200 font-medium h-auto"
                        >
                          Verifikasi
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
