'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Alert, Pagination } from '@/components/ui';
import BerkasTable from '@/components/tables/BerkasTable';
import AddBerkasModal from '@/components/modals/AddBerkasModal';
import BerkasImportExport from '@/components/modals/BerkasImportExport';
import BerkasFilter, { BerkasFilterValues } from '@/components/filters/BerkasFilter';
import { apiClient } from '@/lib/api';
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

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export default function AllBerkasPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const canAddBerkas =
    currentUser?.roles?.some((r) => ['administrator', 'operator-data-berkas'].includes(r.name)) ??
    false;
  const canCloseBerkas = currentUser?.roles?.some((r) => r.name === 'administrator') ?? false;

  const [berkasList, setBerkasList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filter state
  const [filters, setFilters] = useState<BerkasFilterValues>({});

  const fetchBerkas = async (page = 1, filterParams: BerkasFilterValues = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        includeClosed: 'true', // Show ALL berkas including closed ones
      });

      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.desa) params.append('desa', filterParams.desa);
      if (filterParams.kecamatan) params.append('kecamatan', filterParams.kecamatan);
      if (filterParams.tahunBerkas)
        params.append('tahunBerkas', filterParams.tahunBerkas.toString());

      const response = await apiClient.get<ApiResponse<any>>(`/berkas?${params.toString()}`);

      // Handle both paginated and non-paginated response
      let data = response.data?.data;

      if (data && typeof data === 'object' && 'data' in data) {
        // Paginated response
        setBerkasList(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || data.data?.length || 0);
        setCurrentPage(data.pagination?.page || page);
      } else {
        // Non-paginated response - filter client-side for now
        const allData = Array.isArray(data) ? data : [];

        // Apply client-side filtering
        let filteredData = allData;
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
    fetchBerkas(1, filters);
  }, []);

  const handleFilterChange = (newFilters: BerkasFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchBerkas(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBerkas(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddBerkasSuccess = () => {
    fetchBerkas(currentPage, filters);
  };

  const handleImportSuccess = () => {
    fetchBerkas(currentPage, filters);
  };

  const handleViewBerkas = (id: string) => {
    router.push(`/berkas/detail/${id}`);
  };

  const handleCloseBerkas = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menutup berkas ini?')) {
      return;
    }

    try {
      setError(null);
      await apiClient.patch(`/berkas/${id}/close`);

      alert('Berkas berhasil ditutup');
      fetchBerkas(currentPage, filters);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to close berkas';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Semua Berkas</h1>
          <p className="text-gray-600 mt-1">Kelola data berkas dengan mudah</p>
        </div>
        <div className="flex items-center gap-3">
          <BerkasImportExport
            currentFilters={filters}
            onImportSuccess={handleImportSuccess}
            onExportSuccess={() => {}}
          />
          {canAddBerkas && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              + Tambah Berkas
            </Button>
          )}
        </div>
      </div>

      {error && <Alert type="error" title="Error" message={error} />}

      {/* Filter Component */}
      <BerkasFilter onFilterChange={handleFilterChange} />

      {/* Table */}
      <BerkasTable
        data={berkasList}
        isLoading={loading}
        onView={handleViewBerkas}
        onClose={handleCloseBerkas}
        showActions={{
          view: true,
          close: canCloseBerkas,
        }}
        disableActionsForStatus={['SELESAI', 'DITUTUP']}
      />

      {/* Pagination */}
      {!loading && totalItems > 0 && (
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
