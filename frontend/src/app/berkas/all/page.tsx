'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button, Alert, Pagination, PageHeader } from '@/components/ui';
import BerkasTable from '@/components/tables/BerkasTable';
import AddBerkasModal from '@/components/modals/AddBerkasModal';
import BerkasImportExport from '@/components/modals/BerkasImportExport';
import BerkasFilter, { BerkasFilterValues } from '@/components/filters/BerkasFilter';
import { apiClient } from '@/lib/api';
import { useBerkasList, useCacheInvalidation } from '@/hooks/useQueryHooks';
import { useAuthStore } from '@/stores';

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
  isClosed?: boolean;
  closedAt?: string;
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

export default function AllBerkasPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const canAddBerkas =
    currentUser?.roles?.some((r) => ['administrator', 'operator-data-berkas'].includes(r.name)) ??
    false;
  const canCloseBerkas = currentUser?.roles?.some((r) => r.name === 'administrator') ?? false;

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<BerkasFilterValues>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useBerkasList({
    page: currentPage,
    limit: itemsPerPage,
    includeClosed: true,
    ...filters,
  });

  const berkasList: Berkas[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalItems = data?.pagination?.total ?? 0;

  const { invalidateBerkas } = useCacheInvalidation();

  const handleFilterChange = (newFilters: BerkasFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddBerkasSuccess = () => {
    invalidateBerkas();
  };

  const handleImportSuccess = () => {
    invalidateBerkas();
  };

  const handleViewBerkas = (id: string) => {
    router.push(`/berkas/detail/${id}`);
  };

  const handleCloseBerkas = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menutup berkas ini?')) {
      return;
    }

    try {
      setCloseError(null);
      await apiClient.patch(`/berkas/${id}/close`);
      alert('Berkas berhasil ditutup');
      invalidateBerkas();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to close berkas';
      setCloseError(errorMessage);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Semua Berkas"
        description="Kelola data berkas dengan mudah"
        breadcrumbs={[{ label: 'Berkas' }]}
        actions={
          <>
            <BerkasImportExport
              currentFilters={filters}
              onImportSuccess={handleImportSuccess}
              onExportSuccess={() => {}}
            />
            {canAddBerkas && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap gap-1.5"
              >
                <Plus size={15} strokeWidth={2.5} />
                Tambah Berkas
              </Button>
            )}
          </>
        }
      />

      {(error || closeError) && (
        <Alert
          type="error"
          title="Error"
          message={(error as Error)?.message ?? closeError ?? 'Gagal memuat data'}
        />
      )}

      {/* Filter Component */}
      <BerkasFilter onFilterChange={handleFilterChange} />

      {/* Table */}
      <BerkasTable
        data={berkasList}
        isLoading={isLoading}
        onView={handleViewBerkas}
        onClose={handleCloseBerkas}
        showActions={{
          view: true,
          close: canCloseBerkas,
        }}
        disableActionsForStatus={['SELESAI', 'DITUTUP']}
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

      <AddBerkasModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddBerkasSuccess}
      />
    </div>
  );
}
