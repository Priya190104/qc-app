'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Alert, Pagination, PageHeader } from '@/components/ui';
import { StatusBadge, TableSkeleton, EmptyState, TabBar } from '@/components/berkas';
import BerkasFilter, { BerkasFilterValues } from '@/components/filters/BerkasFilter';
import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types';

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
  const [berkasList, setBerkasList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('proses');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filter state
  const [filters, setFilters] = useState<BerkasFilterValues>({});

  const fetchBerkas = async (
    page = 1,
    filterParams: BerkasFilterValues = {},
    tab: TabType = activeTab
  ) => {
    try {
      setLoading(true);
      setError(null);

      const statusByTab = tab === 'proses' ? 'DI_PETUGAS_PEMETAAN' : 'REVISI_KKS,REVISI_KASI';

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        status: statusByTab,
      });

      // Filter revision berkas hanya yang ditujukan ke PETUGAS_PEMETAAN
      if (tab === 'revisi') {
        params.append('revisionTarget', 'PETUGAS_PEMETAAN');
      }

      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.desa) params.append('desa', filterParams.desa);
      if (filterParams.kecamatan) params.append('kecamatan', filterParams.kecamatan);
      if (filterParams.tahunBerkas)
        params.append('tahunBerkas', filterParams.tahunBerkas.toString());

      const response = await apiClient.get<ApiResponse<any>>(`/berkas?${params.toString()}`);

      let data = response.data?.data;

      if (data && typeof data === 'object' && 'data' in data) {
        // Paginated response
        setBerkasList(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
        setCurrentPage(data.pagination?.page || page);
      } else {
        // Non-paginated response
        const allData = Array.isArray(data) ? data : [];
        let filteredData = allData.filter((b: Berkas) => {
          if (b.status === 'DI_PETUGAS_PEMETAAN') return true;
          if (b.status === 'REVISI_KKS' || b.status === 'REVISI_KASI') {
            // Hanya tampilkan jika revision ditujukan ke PETUGAS_PEMETAAN
            return b.lastRevisionFrom?.includes('PETUGAS_PEMETAAN') ?? false;
          }
          return false;
        });

        // Apply client-side filtering
        if (filterParams.search) {
          filteredData = filteredData.filter(
            (b: Berkas) =>
              b.nomor?.toLowerCase().includes(filterParams.search!.toLowerCase()) ||
              b.namaPemohon?.toLowerCase().includes(filterParams.search!.toLowerCase())
          );
        }
        if (filterParams.desa) {
          filteredData = filteredData.filter((b: Berkas) =>
            b.desa?.toLowerCase().includes(filterParams.desa!.toLowerCase())
          );
        }
        if (filterParams.kecamatan) {
          filteredData = filteredData.filter((b: Berkas) =>
            b.kecamatan?.toLowerCase().includes(filterParams.kecamatan!.toLowerCase())
          );
        }
        if (filterParams.tahunBerkas) {
          filteredData = filteredData.filter((b: Berkas) => {
            const berkasDate = b.tanggalBerkas ? new Date(b.tanggalBerkas) : null;
            return berkasDate?.getFullYear() === filterParams.tahunBerkas;
          });
        }

        // Apply pagination
        const total = filteredData.length;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        setBerkasList(paginatedData);
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
        setCurrentPage(page);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load berkas';
      setError(errorMessage);
      setBerkasList([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerkas(1, filters, activeTab);
  }, []);

  const handleFilterChange = (newFilters: BerkasFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchBerkas(1, newFilters, activeTab);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBerkas(page, filters, activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    fetchBerkas(1, filters, tab);
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

      {error && <Alert type="error" title="Gagal memuat data" message={error} />}

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
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-10">
                  No.
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  No. Berkas
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Pemohon
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Tgl. Masuk
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Kegiatan
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Desa / Kecamatan
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Petugas Pemetaan
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
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

      {!loading && totalItems > 0 && (
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





