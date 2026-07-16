'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Pagination, PageHeader } from '@/components/ui';
import { StatusBadge, TableSkeleton, EmptyState } from '@/components/berkas';
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
  kks?: string;
  createdAt: string;
  updatedAt: string;
}

const COLS = 8;

export default function OperatorDataUkurPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BerkasFilterValues>({});
  const itemsPerPage = 10;

  const { data, isLoading, error } = useBerkasList({
    status: 'DI_OPERATOR_DATA_UKUR',
    page: currentPage,
    limit: itemsPerPage,
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operator Data Ukur"
        description="Daftar berkas yang sedang dikelola data pengukuran lapangan"
        breadcrumbs={[
          { label: 'Berkas Dalam Proses', href: '/berkas/proses' },
          { label: 'Operator Data Ukur' },
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

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-28">
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
                title="Tidak ada berkas ditemukan"
                description="Berkas dengan status Di Operator Data Ukur akan muncul di sini."
              />
            ) : (
              berkasList.map((berkas, index) => (
                <tr key={berkas.id} className="hover:bg-blue-50/40 transition-colors duration-100">
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
                      className="text-xs text-gray-700 truncate block max-w-[160px]"
                      title={berkas.namaPemohon || '-'}
                    >
                      {berkas.namaPemohon || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                    {berkas.tanggalBerkas
                      ? (() => {
                          try {
                            const date = new Date(berkas.tanggalBerkas);
                            return isNaN(date.getTime())
                              ? '-'
                              : date.toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                });
                          } catch {
                            return '-';
                          }
                        })()
                      : '-'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="text-xs text-gray-700 truncate block max-w-[140px]"
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
                    <StatusBadge status={berkas.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/berkas/proses/operator-data-ukur/${berkas.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2.5 py-1 text-blue-600 hover:bg-blue-50 border-blue-200 font-medium h-auto"
                      >
                        Kelola Data
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
