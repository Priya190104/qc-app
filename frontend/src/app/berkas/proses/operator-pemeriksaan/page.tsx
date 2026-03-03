'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Alert } from '@/components/ui';
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
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export default function OperatorPemeriksaanPage() {
  const [berkasList, setBerkasList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBerkas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<ApiResponse<Berkas[]>>('/berkas');

        let data = response.data?.data;
        if (!Array.isArray(data)) {
          data = [];
        }

        data = data.filter((b: Berkas) => b.status === 'pending' || b.status === 'in_review');
        setBerkasList(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load berkas';
        setError(errorMessage);
        setBerkasList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBerkas();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'in_review':
        return 'Sedang Direview';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading berkas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses">
          <Button variant="outline">← Kembali</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">🔍 Operator Pemeriksaan</h1>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
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
            {berkasList.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-gray-500 font-medium"
                >
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
                    {index + 1}
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
                      ? new Date(berkas.tanggalBerkas).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
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
                      <span className="block text-[10px] text-gray-500">{berkas.kecamatan || '-'}</span>
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] px-2 py-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-300 font-medium"
                    >
                      Periksa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
