'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  PageHeader,
  Modal,
  ModalHeader,
  ModalBody,
  SectionLoader,
  LoadingSpinner,
} from '@/components/ui';
import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types';

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

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handlePetugasClick = async (petugas: PetugasStat, tipe: 'ukur' | 'pemetaan') => {
    setModalPetugas({ nama: petugas.nama, nip: petugas.nip, tipe });
    setModalBerkas([]);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await apiClient.get<{ data?: { data?: BerkasSummaryItem[]; total?: number } }>(
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
    return <SectionLoader label="Memuat dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Petugas Berkas Modal */}
      <Modal
        isOpen={modalOpen && !!modalPetugas}
        onClose={closeModal}
        titleId="modal-title"
        maxWidth="3xl"
      >
        <ModalHeader
          id="modal-title"
          title={`Ringkasan Berkas — ${modalPetugas?.nama}`}
          subtitle={`NIP: ${modalPetugas?.nip}`}
          onClose={closeModal}
        />
        <ModalBody scrollable>
          {modalLoading ? (
            <div className="text-center py-10">
              <LoadingSpinner size="md" label="Memuat data..." />
            </div>
          ) : modalBerkas.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Tidak ada berkas aktif saat ini</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 pr-3 text-xs font-semibold text-gray-700 w-8">No</th>
                  <th className="pb-3 pr-3 text-xs font-semibold text-gray-700">No. Berkas</th>
                  <th className="pb-3 pr-3 text-xs font-semibold text-gray-700">Nama Pemohon</th>
                  <th className="pb-3 pr-3 text-xs font-semibold text-gray-700">Kegiatan</th>
                  <th className="pb-3 text-xs font-semibold text-gray-700">Jenis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {modalBerkas.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-3 text-gray-500 text-xs">{b.no}</td>
                    <td className="py-3 pr-3 font-medium text-gray-900">{b.nomor}</td>
                    <td className="py-3 pr-3 text-gray-700">{b.namaPemohon}</td>
                    <td className="py-3 pr-3 text-gray-600">{b.kegiatan}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                          b.jenis === 'Revisi'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
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
        </ModalBody>
        {!modalLoading && modalBerkas.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
            Total: <span className="font-medium text-gray-700">{modalBerkas.length}</span> berkas
            aktif
          </div>
        )}
      </Modal>
      <PageHeader title="Dashboard" description="Monitoring status dan performa sistem QC berkas" />

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* Dashboard Summary */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600">Total Berkas</div>
              <div className="text-4xl font-bold text-gray-900 mt-3">
                {metrics.summary?.totalBerkas || 0}
              </div>
              <p className="text-sm text-gray-500 mt-2">Keseluruhan berkas dalam sistem</p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600">Dalam Proses</div>
              <div className="text-4xl font-bold text-amber-600 mt-3">
                {metrics.summary?.inProcessBerkas || 0}
              </div>
              <p className="text-sm text-gray-500 mt-2">Sedang diproses</p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600">Selesai</div>
              <div className="text-4xl font-bold text-green-600 mt-3">
                {metrics.summary?.completedBerkas || 0}
              </div>
              <p className="text-sm text-gray-500 mt-2">Berkas selesai diproses</p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600">Ditutup</div>
              <div className="text-4xl font-bold text-red-600 mt-3">
                {metrics.summary?.ditutup || 0}
              </div>
              <p className="text-sm text-gray-500 mt-2">Berkas ditutup</p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Berkas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Dibuat</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.dibuat || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Op. Data Ukur</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.diOperatorDataUkur || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Petugas Ukur</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.diPetugasUkur || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Op. Pemetaan</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.diOperatorDataPemetaan || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Petugas Pemetaan</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.diPetugasPemetaan || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Pemilihan KKS</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.pemilihanKKS || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Di KKS</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.diKKS || 0}
                </div>
              </div>
              <div className="border border-amber-300 rounded-lg p-4 bg-amber-50 hover:bg-amber-100 transition-colors">
                <div className="text-xs font-medium text-amber-700">Revisi KKS</div>
                <div className="text-2xl font-bold text-amber-700 mt-2">
                  {metrics.statusDistribution?.revisiKKS || 0}
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium text-gray-500">Kepala Seksi</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.statusDistribution?.diKepalaSeksi || 0}
                </div>
              </div>
              <div className="border border-red-300 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors">
                <div className="text-xs font-medium text-red-700">Revisi Kasi</div>
                <div className="text-2xl font-bold text-red-700 mt-2">
                  {metrics.statusDistribution?.revisiKasi || 0}
                </div>
              </div>
              <div className="border border-green-300 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors">
                <div className="text-xs font-medium text-green-700">Selesai</div>
                <div className="text-2xl font-bold text-green-700 mt-2">
                  {metrics.statusDistribution?.selesai || 0}
                </div>
              </div>
              <div className="border border-red-300 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors">
                <div className="text-xs font-medium text-red-700">Ditutup</div>
                <div className="text-2xl font-bold text-red-700 mt-2">
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Petugas Ukur</h2>
            {petugasStats.petugasUkur && petugasStats.petugasUkur.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {petugasStats.petugasUkur.map((petugas) => (
                  <button
                    key={petugas.id}
                    onClick={() => handlePetugasClick(petugas, 'ukur')}
                    className="text-left border border-indigo-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{petugas.nama}</div>
                        <div className="text-sm text-gray-600">NIP: {petugas.nip}</div>
                      </div>
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold"
                        aria-label={`Total ${petugas.jumlahProses + petugas.jumlahRevisi} berkas`}
                      >
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
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">Tidak ada data petugas ukur</p>
            )}
          </div>

          {/* Petugas Pemetaan */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monitoring Petugas Pemetaan
            </h2>
            {petugasStats.petugasPemetaan && petugasStats.petugasPemetaan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {petugasStats.petugasPemetaan.map((petugas) => (
                  <button
                    key={petugas.id}
                    onClick={() => handlePetugasClick(petugas, 'pemetaan')}
                    className="text-left border border-teal-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-teal-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{petugas.nama}</div>
                        <div className="text-sm text-gray-600">NIP: {petugas.nip}</div>
                      </div>
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold"
                        aria-label={`Total ${petugas.jumlahProses + petugas.jumlahRevisi} berkas`}
                      >
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
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">Tidak ada data petugas pemetaan</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
