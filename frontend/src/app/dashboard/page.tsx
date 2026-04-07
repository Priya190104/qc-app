'use client';

import React, { useState, useEffect } from 'react';
import { Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';

interface DashboardMetrics {
  summary: {
    totalBerkas: number;
    inProcessBerkas: number;
    completedBerkas: number;
    ditutup: number;
  };
  statusDistribution: {
    dibuat: number;
    diOperatorDataUkur: number;
    diPetugasUkur: number;
    diOperatorDataPemetaan: number;
    diPetugasPemetaan: number;
    pemilihanKKS: number;
    diKKS: number;
    revisiKKS: number;
    diKepalaSeksi: number;
    revisiKasi: number;
    selesai: number;
    ditutup: number;
  };
}

interface PetugasStat {
  id: string;
  nama: string;
  nip: string;
  departemen: string;
  jumlahProses: number;
  jumlahRevisi: number;
}

interface PetugasStats {
  petugasUkur: PetugasStat[];
  petugasPemetaan: PetugasStat[];
}

interface BerkasSummaryItem {
  no: number;
  id: string;
  nomor: string;
  namaPemohon: string;
  kegiatan: string;
  jenis: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [petugasStats, setPetugasStats] = useState<PetugasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPetugas, setModalPetugas] = useState<{
    nama: string;
    nip: string;
    tipe: 'ukur' | 'pemetaan';
  } | null>(null);
  const [modalBerkas, setModalBerkas] = useState<BerkasSummaryItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const handlePetugasClick = async (petugas: PetugasStat, tipe: 'ukur' | 'pemetaan') => {
    setModalPetugas({ nama: petugas.nama, nip: petugas.nip, tipe });
    setModalBerkas([]);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await apiClient.get<ApiResponse<{ data: BerkasSummaryItem[]; total: number }>>(
        `/dashboard/petugas-berkas?petugasId=${petugas.id}&tipe=${tipe}`
      );
      setModalBerkas(res.data?.data?.data || []);
    } catch {
      setModalBerkas([]);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard metrics and petugas stats in parallel
        const [metricsResponse, petugasResponse] = await Promise.all([
          apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics'),
          apiClient.get<ApiResponse<PetugasStats>>('/dashboard/petugas-stats'),
        ]);

        if (metricsResponse.data?.data) {
          setMetrics(metricsResponse.data.data);
        }

        if (petugasResponse.data?.data) {
          setPetugasStats(petugasResponse.data.data);
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to load dashboard';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Petugas Berkas Modal */}
      {modalOpen && modalPetugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {modalPetugas.tipe === 'ukur' ? '📐' : '🗺️'} Ringkasan Berkas —{' '}
                  {modalPetugas.nama}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">NIP: {modalPetugas.nip}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {modalLoading ? (
                <div className="text-center py-10 text-gray-500">⌛ Memuat data...</div>
              ) : modalBerkas.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  Tidak ada berkas aktif saat ini
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-2 pr-3 text-xs font-semibold text-gray-500 w-8">No</th>
                      <th className="pb-2 pr-3 text-xs font-semibold text-gray-500">No. Berkas</th>
                      <th className="pb-2 pr-3 text-xs font-semibold text-gray-500">
                        Nama Pemohon
                      </th>
                      <th className="pb-2 pr-3 text-xs font-semibold text-gray-500">Kegiatan</th>
                      <th className="pb-2 text-xs font-semibold text-gray-500">Jenis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {modalBerkas.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-3 text-gray-400 text-xs">{b.no}</td>
                        <td className="py-2 pr-3 font-medium text-gray-900">{b.nomor}</td>
                        <td className="py-2 pr-3 text-gray-700">{b.namaPemohon}</td>
                        <td className="py-2 pr-3 text-gray-600">{b.kegiatan}</td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              b.jenis === 'Revisi'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {b.jenis}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            {!modalLoading && modalBerkas.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                Total: {modalBerkas.length} berkas aktif
              </div>
            )}
          </div>
        </div>
      )}
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitoring Sistem QC Berkas</p>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* Dashboard Summary */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm font-medium opacity-90">Total Berkas</div>
              <div className="text-4xl font-bold mt-2">{metrics.summary?.totalBerkas || 0}</div>
              <div className="text-xs opacity-75 mt-2">Keseluruhan berkas</div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm font-medium opacity-90">Dalam Proses</div>
              <div className="text-4xl font-bold mt-2">{metrics.summary?.inProcessBerkas || 0}</div>
              <div className="text-xs opacity-75 mt-2">Sedang diproses</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm font-medium opacity-90">Selesai</div>
              <div className="text-4xl font-bold mt-2">{metrics.summary?.completedBerkas || 0}</div>
              <div className="text-xs opacity-75 mt-2">Berkas selesai</div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm font-medium opacity-90">Ditutup</div>
              <div className="text-4xl font-bold mt-2">{metrics.summary?.ditutup || 0}</div>
              <div className="text-xs opacity-75 mt-2">Berkas ditutup</div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Distribusi Status Berkas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Dibuat</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.dibuat || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Op. Data Ukur</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.diOperatorDataUkur || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Petugas Ukur</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.diPetugasUkur || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Op. Pemetaan</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.diOperatorDataPemetaan || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Petugas Pemetaan</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.diPetugasPemetaan || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Pemilihan KKS</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.pemilihanKKS || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Di KKS</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.diKKS || 0}
                </div>
              </div>
              <div className="border border-orange-300 rounded-lg p-4 bg-orange-50">
                <div className="text-xs text-orange-700 uppercase font-medium">Revisi KKS</div>
                <div className="text-2xl font-bold text-orange-700 mt-1">
                  {metrics.statusDistribution?.revisiKKS || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Kepala Seksi</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.statusDistribution?.diKepalaSeksi || 0}
                </div>
              </div>
              <div className="border border-red-300 rounded-lg p-4 bg-red-50">
                <div className="text-xs text-red-700 uppercase font-medium">Revisi Kasi</div>
                <div className="text-2xl font-bold text-red-700 mt-1">
                  {metrics.statusDistribution?.revisiKasi || 0}
                </div>
              </div>
              <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                <div className="text-xs text-green-700 uppercase font-medium">Selesai</div>
                <div className="text-2xl font-bold text-green-700 mt-1">
                  {metrics.statusDistribution?.selesai || 0}
                </div>
              </div>
              <div className="border border-red-300 rounded-lg p-4 bg-red-50">
                <div className="text-xs text-red-700 uppercase font-medium">Ditutup</div>
                <div className="text-2xl font-bold text-red-700 mt-1">
                  {metrics.statusDistribution?.ditutup || 0}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Petugas Monitoring */}
      {petugasStats && (
        <>
          {/* Petugas Ukur */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📐 Monitoring Petugas Ukur</h2>
            {petugasStats.petugasUkur && petugasStats.petugasUkur.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {petugasStats.petugasUkur.map((petugas) => (
                  <div
                    key={petugas.id}
                    onClick={() => handlePetugasClick(petugas, 'ukur')}
                    className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{petugas.nama}</div>
                        <div className="text-sm text-gray-600">NIP: {petugas.nip}</div>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                        {petugas.jumlahProses + petugas.jumlahRevisi}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Berkas Proses:</span>
                        <span className="font-semibold text-indigo-700">
                          {petugas.jumlahProses}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Berkas Revisi:</span>
                        <span className="font-semibold text-orange-600">
                          {petugas.jumlahRevisi}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Tidak ada data petugas ukur</p>
            )}
          </div>

          {/* Petugas Pemetaan */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Monitoring Petugas Pemetaan</h2>
            {petugasStats.petugasPemetaan && petugasStats.petugasPemetaan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {petugasStats.petugasPemetaan.map((petugas) => (
                  <div
                    key={petugas.id}
                    onClick={() => handlePetugasClick(petugas, 'pemetaan')}
                    className="border border-teal-200 rounded-lg p-4 bg-teal-50 hover:shadow-md hover:border-teal-400 transition-all cursor-pointer select-none"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{petugas.nama}</div>
                        <div className="text-sm text-gray-600">NIP: {petugas.nip}</div>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold">
                        {petugas.jumlahProses + petugas.jumlahRevisi}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Berkas Proses:</span>
                        <span className="font-semibold text-teal-700">{petugas.jumlahProses}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Berkas Revisi:</span>
                        <span className="font-semibold text-orange-600">
                          {petugas.jumlahRevisi}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Tidak ada data petugas pemetaan</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
