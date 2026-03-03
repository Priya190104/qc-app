'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Pagination } from '@/components/ui';
import BerkasTable from '@/components/tables/BerkasTable';
import BerkasFilter, { BerkasFilterValues } from '@/components/filters/BerkasFilter';
import { apiClient } from '@/lib/api';

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

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export default function SelesaiBerkasPage() {
  const router = useRouter();
  const [berkasList, setBerkasList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        status: 'SELESAI',
      });

      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.desa) params.append('desa', filterParams.desa);
      if (filterParams.kecamatan) params.append('kecamatan', filterParams.kecamatan);
      if (filterParams.tahunBerkas)
        params.append('tahunBerkas', filterParams.tahunBerkas.toString());

      const response = await apiClient.get<ApiResponse<any>>(`/berkas?${params.toString()}`);

      let data = response.data?.data;

      if (data && typeof data === 'object' && 'data' in data) {
        // Paginated response
        const filteredData = Array.isArray(data.data)
          ? data.data.filter((b: Berkas) => b.status === 'SELESAI')
          : [];
        setBerkasList(filteredData);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || filteredData.length);
        setCurrentPage(data.pagination?.page || page);
      } else {
        // Non-paginated response
        const allData = Array.isArray(data) ? data : [];

        // Filter for SELESAI status
        let filteredData = allData.filter((b: Berkas) => b.status === 'SELESAI');

        // Apply client-side filters
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

  const handleViewBerkas = (id: string) => {
    router.push(`/berkas/detail/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">✅ Berkas Selesai</h1>
        <p className="text-gray-600 mt-1">Berkas yang telah disetujui</p>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* Filter Component */}
      <BerkasFilter onFilterChange={handleFilterChange} />

      {/* Table */}
      <BerkasTable
        data={berkasList}
        isLoading={loading}
        onView={handleViewBerkas}
        showActions={{
          view: true,
          close: false,
        }}
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
    </div>
  );
}
