'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { apiClient } from '@/lib/api';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';

type TabType = 'detail' | 'history' | 'catatan';

interface Berkas {
  id: string;
  nomor: string;
  namaPemohon?: string;
  tanggalBerkas?: string;
  kegiatan?: string;
  desa?: string;
  kecamatan?: string;
  status: string;
  tahunBerkas?: number;
  namaProsedur?: string;
  luasPendaftaran?: number;
  di302?: string;
  di305?: string;
  kks?: string;
  noSTP?: string;
  tglSTP?: string;
  noSHATNIBEL?: string;
  luasHasilUkur?: number;
  nib?: string;
  nibel?: string;
  jumlahBidang?: number;
  noSU?: string;
  bidangItems?: Array<{
    luasHasilUkur?: number;
    nib?: string;
    nibel?: string;
    noSU?: string;
  }>;
  deskripsi?: string;
  petugasUkur?: {
    nama: string;
    nip: string;
  };
  puLapang?: {
    nama: string;
    nip: string;
  };
  petugasPemetaan?: {
    nama: string;
    nip: string;
  };
  petugasKKS?: {
    nama: string;
    nip: string;
  };
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  history?: Array<{
    id: string;
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    changedAt: string;
  }>;
}

export default function BerkasDetailPage() {
  const params = useParams();
  const berkasId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBerkasDetail();
  }, [berkasId]);

  const fetchBerkasDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<any>(`/berkas/${berkasId}`);
      // API returns { statusCode, message, data }
      const berkasData = response.data?.data || response.data;
      setBerkas(berkasData as Berkas);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat detail berkas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DIBUAT: { label: 'Dibuat', className: 'bg-gray-100 text-gray-800' },
      DI_OPERATOR_DATA_UKUR: {
        label: 'Di Operator Data Ukur',
        className: 'bg-blue-100 text-blue-800',
      },
      DI_PETUGAS_UKUR: { label: 'Di Petugas Ukur', className: 'bg-indigo-100 text-indigo-800' },
      DI_OPERATOR_DATA_PEMETAAN: {
        label: 'Di Operator Data Pemetaan',
        className: 'bg-cyan-100 text-cyan-800',
      },
      DI_PETUGAS_PEMETAAN: { label: 'Di Petugas Pemetaan', className: 'bg-teal-100 text-teal-800' },
      PEMILIHAN_KKS: { label: 'Pemilihan KKS', className: 'bg-yellow-100 text-yellow-800' },
      DI_KKS: { label: 'Di KKS', className: 'bg-purple-100 text-purple-800' },
      REVISI_KKS: { label: 'Revisi KKS', className: 'bg-orange-100 text-orange-800' },
      DI_KEPALA_SEKSI: { label: 'Di Kepala Seksi', className: 'bg-indigo-100 text-indigo-800' },
      REVISI_KASI: { label: 'Revisi Kepala Seksi', className: 'bg-red-100 text-red-800' },
      SELESAI: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      DITUTUP: { label: 'Ditutup', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Memuat data berkas...</p>
        </div>
      </div>
    );
  }

  if (error || !berkas) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error || 'Berkas tidak ditemukan'}</p>
        </div>
        <Link href="/berkas/all">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/berkas/all">
          <Button variant="outline">← Kembali</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">📄 Detail Berkas</h1>
      </div>

      {/* Main Card with Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('detail')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'detail'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Detail Berkas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📜 History
            </button>
            <button
              onClick={() => setActiveTab('catatan')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catatan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Catatan
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'detail' && (
            <div className="space-y-6">
              {/* Informasi Dasar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">No. Berkas</h4>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">{berkas.nomor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-1">{getStatusBadge(berkas.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Nama Pemohon</h4>
                    <p className="mt-1 text-sm text-gray-900">{berkas.namaPemohon || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tanggal Berkas</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(berkas.tanggalBerkas)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tahun Berkas</h4>
                    <p className="mt-1 text-sm text-gray-900">{berkas.tahunBerkas || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Kegiatan</h4>
                    <p className="mt-1 text-sm text-gray-900">{berkas.kegiatan || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Desa</h4>
                    <p className="mt-1 text-sm text-gray-900">{berkas.desa || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Kecamatan</h4>
                    <p className="mt-1 text-sm text-gray-900">{berkas.kecamatan || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Nama Prosedur</h4>
                    <p className="mt-1 text-sm text-gray-900">{berkas.namaProsedur || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Luas Pendaftaran</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {berkas.luasPendaftaran
                        ? `${berkas.luasPendaftaran.toLocaleString('id-ID')} m²`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Pengukuran */}
              {(berkas.petugasUkur || berkas.puLapang || berkas.noSTP) && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pengukuran</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Petugas Ukur</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.petugasUkur
                          ? `${berkas.petugasUkur.nama} (${berkas.petugasUkur.nip})`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">PU Lapang</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.puLapang ? `${berkas.puLapang.nama} (${berkas.puLapang.nip})` : '-'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">No. STP</h4>
                      <p className="mt-1 text-sm text-gray-900">{berkas.noSTP || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tanggal STP</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(berkas.tglSTP)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">No. SHAT/NIBEL</h4>
                      <p className="mt-1 text-sm text-gray-900">{berkas.noSHATNIBEL || '-'}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Data Pemetaan */}
              {(berkas.petugasPemetaan ||
                berkas.luasHasilUkur ||
                berkas.nib ||
                berkas.jumlahBidang) && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pemetaan</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Petugas Pemetaan</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.petugasPemetaan
                          ? `${berkas.petugasPemetaan.nama} (${berkas.petugasPemetaan.nip})`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Jumlah Bidang</h4>
                      <p className="mt-1 text-sm font-semibold text-purple-700">
                        {berkas.jumlahBidang || '-'}
                      </p>
                    </div>
                  </div>
                  {berkas.bidangItems && berkas.bidangItems.length > 0 ? (
                    <div className="space-y-3">
                      {berkas.bidangItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="border border-purple-200 rounded-lg p-4 bg-purple-50"
                        >
                          <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">
                            Bidang {idx + 1}
                          </h4>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Luas Hasil Ukur</p>
                              <p className="mt-0.5 text-sm font-medium text-gray-900">
                                {item.luasHasilUkur
                                  ? `${item.luasHasilUkur.toLocaleString('id-ID')} m²`
                                  : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">NIB</p>
                              <p className="mt-0.5 text-sm font-medium text-gray-900">
                                {item.nib || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">NIBEL</p>
                              <p className="mt-0.5 text-sm font-medium text-gray-900">
                                {item.nibel || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">No. SU</p>
                              <p className="mt-0.5 text-sm font-medium text-gray-900">
                                {item.noSU || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Luas Hasil Ukur</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {berkas.luasHasilUkur
                              ? `${berkas.luasHasilUkur.toLocaleString('id-ID')} m²`
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">NIB</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {berkas.nib || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">NIBEL</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {berkas.nibel || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">No. SU</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {berkas.noSU || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Data KKS */}
              {berkas.petugasKKS && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pemeriksaan KKS</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Petugas KKS</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.petugasKKS.nama} ({berkas.petugasKKS.nip})
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Dibuat Oleh</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {berkas.createdBy
                        ? `${berkas.createdBy.firstName} ${berkas.createdBy.lastName}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tanggal Dibuat</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(berkas.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {berkas.history && berkas.history.length > 0 ? (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {berkas.history.map((item, itemIdx) => (
                      <li key={item.id}>
                        <div className="relative pb-8">
                          {itemIdx !== berkas.history!.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <span className="text-white text-xs">📋</span>
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-900">
                                  Status diubah dari{' '}
                                  <span className="font-medium">{item.oldStatus || '-'}</span> ke{' '}
                                  <span className="font-medium">{item.newStatus || '-'}</span>
                                </p>
                                {item.reason && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Alasan: {item.reason}
                                  </p>
                                )}
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                {new Date(item.changedAt).toLocaleString('id-ID')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Tidak ada history</p>
              )}
            </div>
          )}

          {activeTab === 'catatan' && (
            <BerkasCatatanTab berkasId={berkasId} initialDeskripsi={berkas?.deskripsi} />
          )}
        </div>
      </div>
    </div>
  );
}
