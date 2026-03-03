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
  status: string;
  petugasKKS?: {
    nama: string;
    nip: string;
  };
  petugasUkur?: {
    nama: string;
    nip: string;
  };
  createdAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export default function KKSPage() {
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
          ? data.data.filter((b: Berkas) => b.status === 'DI_KKS')
          : [];
        setBerkasList(filteredData);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || filteredData.length);
        setCurrentPage(data.pagination?.page || page);
      } else {
        // Non-paginated response
        const allData = Array.isArray(data) ? data : [];
        let filteredData = allData.filter((b: Berkas) => b.status === 'DI_KKS');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses">
          <Button variant="outline">← Kembali</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          🎯 KKS (Koordinator Kelompok Substansi)
        </h1>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* Filter Component */}
      <BerkasFilter onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                No.
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                No. Berkas
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Nama Pemohon
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Tanggal Masuk
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Kegiatan
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Desa, Kecamatan
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Koordinator
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Petugas Ukur
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <div className="animate-spin text-4xl mb-4 inline-block">⌛</div>
                  <p className="text-gray-600">Loading berkas...</p>
                </td>
              </tr>
            ) : berkasList.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-sm text-gray-500 font-medium"
                >
                  Tidak ada berkas ditemukan
                </td>
              </tr>
            ) : (
              berkasList.map((berkas, index) => (
                <tr key={berkas.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{berkas.nomor}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{berkas.namaPemohon || '-'}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                    {berkas.tanggalBerkas
                      ? new Date(berkas.tanggalBerkas).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{berkas.kegiatan || '-'}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">
                    <span className="block font-medium">{berkas.desa || '-'}</span>
                    <span className="block text-[10px] text-gray-500">{berkas.kecamatan || '-'}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">
                    {berkas.petugasKKS ? (
                      <div className="inline-flex flex-col items-start px-2 py-1 rounded-md text-gray-700 text-xs font-medium">
                        <span className="block font-medium">{berkas.petugasKKS.nama}</span>
                        <span className="text-gray-500">{berkas.petugasKKS.nip}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">
                    {berkas.petugasUkur?.nama || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link href={`/berkas/proses/kks/${berkas.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] px-2 py-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-300 font-medium"
                      >
                        Verifikasi Data
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
