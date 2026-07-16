'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Pagination, PageHeader } from '@/components/ui';
import BerkasTable from '@/components/tables/BerkasTable';
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
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function SelesaiBerkasPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BerkasFilterValues>({});
  const itemsPerPage = 10;

  const { data, isLoading, error } = useBerkasList({
    status: 'SELESAI',
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

  const handleViewBerkas = (id: string) => {
    router.push(`/berkas/detail/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berkas Selesai"
        description="Berkas yang telah disetujui"
        breadcrumbs={[{ label: 'Berkas' }]}
      />

      {error && (
        <Alert
          type="error"
          title="Error"
          message={(error as Error)?.message ?? 'Gagal memuat data'}
          className="mb-6"
        />
      )}

      {/* Filter Component */}
      <BerkasFilter onFilterChange={handleFilterChange} />

      {/* Table */}
      <BerkasTable
        data={berkasList}
        isLoading={isLoading}
        onView={handleViewBerkas}
        showActions={{
          view: true,
          close: false,
        }}
      />

      {/* Pagination */}
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
