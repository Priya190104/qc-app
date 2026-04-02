'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Alert, Pagination } from '@/components/ui';
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
  kks?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export default function OperatorDataUkurPage() {
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
        status: 'DI_OPERATOR_DATA_UKUR',
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
        setBerkasList(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
        setCurrentPage(data.pagination?.page || page);
      } else {
        // Non-paginated response
        const allData = Array.isArray(data) ? data : [];
        let filteredData = allData.filter((b: Berkas) => b.status === 'DI_OPERATOR_DATA_UKUR');

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DI_OPERATOR_DATA_UKUR':
        return 'bg-blue-100 text-blue-800';
      case 'DI_PETUGAS_UKUR':
        return 'bg-cyan-100 text-cyan-800';
      case 'SELESAI':
        return 'bg-green-100 text-green-800';
      case 'DITUTUP':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DI_OPERATOR_DATA_UKUR':
        return 'Di Operator Data Ukur';
      case 'DI_PETUGAS_UKUR':
        return 'Di Petugas Ukur';
      case 'SELESAI':
        return 'Selesai';
      case 'DITUTUP':
        return 'Ditutup';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses">
          <Button variant="outline">← Kembali</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">📏 Operator Data Ukur</h1>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* Filter Component */}
      <BerkasFilter onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '5%' }}
              >
                No.
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '11%' }}
              >
                No. Berkas
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '16%' }}
              >
                Nama Pemohon
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '11%' }}
              >
                Tanggal Masuk
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '16%' }}
              >
                Kegiatan
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '16%' }}
              >
                Desa, Kecamatan
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '10%' }}
              >
                Status
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
                style={{ width: '15%' }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="animate-spin text-4xl mb-4 inline-block">⌛</div>
                  <p className="text-gray-600">Loading berkas...</p>
                </td>
              </tr>
            ) : berkasList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500 font-medium">
                  Tidak ada berkas ditemukan
                </td>
              </tr>
            ) : (
              berkasList.map((berkas, index) => (
                <tr key={berkas.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td
                    className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-gray-900"
                    style={{ width: '5%' }}
                  >
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td
                    className="px-3 py-2.5 text-xs font-medium text-gray-900"
                    style={{ width: '11%' }}
                  >
                    <div className="truncate" title={berkas.nomor}>
                      {berkas.nomor}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700" style={{ width: '16%' }}>
                    <div className="truncate" title={berkas.namaPemohon || '-'}>
                      {berkas.namaPemohon || '-'}
                    </div>
                  </td>
                  <td
                    className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap"
                    style={{ width: '11%' }}
                  >
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
                          } catch (e) {
                            return '-';
                          }
                        })()
                      : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700" style={{ width: '16%' }}>
                    <div className="truncate" title={berkas.kegiatan || '-'}>
                      {berkas.kegiatan || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700" style={{ width: '16%' }}>
                    <div
                      className="truncate"
                      title={`${berkas.desa || '-'}, ${berkas.kecamatan || '-'}`}
                    >
                      <span className="block font-medium">{berkas.desa || '-'}</span>
                      <span className="block text-[10px] text-gray-500">
                        {berkas.kecamatan || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap" style={{ width: '10%' }}>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(berkas.status)}`}
                    >
                      {getStatusLabel(berkas.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap" style={{ width: '15%' }}>
                    <Link href={`/berkas/proses/operator-data-ukur/${berkas.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] px-2 py-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-300 font-medium"
                      >
                        📊 Kelola Data
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
