'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, PageHeader, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, usePetugasList, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';

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
  kks?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields
  tahunBerkas?: number;
  namaProsedur?: string;
  luasPendaftaran?: number;
  di302?: string;
  di305?: string;
  // KKS Workflow Fields
  petugasUkurId?: string;
  puLapangId?: string;
  noSTP?: string;
  tglSTP?: string;
  noSHATNIBEL?: string;
  petugasUkur?: {
    id: string;
    nama: string;
    nip: string;
  };
  puLapang?: {
    id: string;
    nama: string;
    nip: string;
  };
  history?: BerkasHistory[];
}

interface BerkasHistory {
  id: string;
  berkasId: string;
  oldStatus?: string;
  newStatus?: string;
  reason?: string;
  changedAt: string;
}

interface Petugas {
  id: string;
  nama: string;
  nip: string;
  jabatan?: string;
}

type TabType = 'update' | 'detail' | 'history' | 'catatan';

export default function ValidasiBerkasPetugasUkurPage() {
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('update');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: berkas, isLoading } = useBerkasDetail(id);
  const { data: allPetugas } = usePetugasList('Petugas Ukur');
  const petugasList: Petugas[] = allPetugas ?? [];
  const { invalidateBerkas } = useCacheInvalidation();

  // Form state - Petugas Ukur mengelola PU Lapang dan validasi
  const [formData, setFormData] = useState({
    puLapangId: '',
    notes: '',
  });

  useEffect(() => {
    if (berkas) {
      setFormData({
        puLapangId: (berkas as any).puLapangId || '',
        notes: '',
      });
    }
  }, [berkas]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        puLapangId: formData.puLapangId || undefined,
        notes: formData.notes || undefined,
      };

      // Use workflow API untuk validasi pengukuran
      await apiClient.post(`/berkas/workflow/${id}/petugas-ukur/validate`, updateData);
      setSuccess('Pengukuran berkas berhasil divalidasi dan dilanjutkan ke Operator Data Pemetaan');

      // Redirect back to list after success
      setTimeout(() => {
        window.location.href = '/berkas/proses/petugas-ukur';
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to validate berkas';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!berkas) {
    return (
      <div className="space-y-6">
        <Alert type="error" title="Error" message="Berkas tidak ditemukan" />
        <Link href="/berkas/proses/petugas-ukur">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validasi Pengukuran Berkas"
        breadcrumbs={[
          { label: 'Berkas Dalam Proses', href: '/berkas/proses' },
          { label: 'Petugas Ukur', href: '/berkas/proses/petugas-ukur' },
          { label: 'Detail Berkas' },
        ]}
      />

      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Success" message={success} />}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('update')}
              className={`${
                activeTab === 'update'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Validasi Pengukuran
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`${
                activeTab === 'detail'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detail Berkas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              History Berkas
            </button>
            <button
              onClick={() => setActiveTab('catatan')}
              className={`${
                activeTab === 'catatan'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              📝 Catatan
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Validasi Pengukuran */}
          {activeTab === 'update' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* PU Lapang */}
                <div>
                  <label
                    htmlFor="puLapangId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    PU Lapang
                  </label>
                  <select
                    id="puLapangId"
                    name="puLapangId"
                    value={formData.puLapangId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Pilih PU Lapang (Opsional)</option>
                    {petugasList.map((petugas) => (
                      <option key={petugas.id} value={petugas.id}>
                        {petugas.nama} ({petugas.nip})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Pilih PU Lapang yang akan ditugaskan untuk berkas ini (opsional)
                  </p>
                </div>

                {/* Catatan Validasi */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Validasi
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Tambahkan catatan atau komentar (opsional)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/berkas/proses/petugas-ukur">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? 'Memproses...' : '✓ Validasi & Lanjutkan'}
                </Button>
              </div>
            </form>
          )}

          {/* Tab: Detail Berkas */}
          {activeTab === 'detail' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Informasi Dasar */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nomor Berkas</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.nomor}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nama Pemohon</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.namaPemohon || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Berkas</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {(() => {
                      if (!berkas.tanggalBerkas) return '-';
                      try {
                        const date = new Date(berkas.tanggalBerkas);
                        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID');
                      } catch {
                        return '-';
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Kegiatan</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.kegiatan || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tahun Berkas</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.tahunBerkas || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Desa</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.desa || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Kecamatan</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.kecamatan || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nama Prosedur</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.namaProsedur || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Luas Pendaftaran</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {berkas.luasPendaftaran
                      ? `${berkas.luasPendaftaran.toLocaleString('id-ID')} m²`
                      : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">DI.302</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.di302 || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">DI.305</h3>
                  <p className="mt-1 text-sm text-gray-900">{berkas.di305 || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                        berkas.status === 'PROSES'
                          ? 'bg-yellow-100 text-yellow-700'
                          : berkas.status === 'SELESAI'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {berkas.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Data Pengukuran */}
              {(berkas.petugasUkur ||
                berkas.puLapang ||
                berkas.noSTP ||
                berkas.tglSTP ||
                berkas.noSHATNIBEL) && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pengukuran</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Petugas Ukur</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.petugasUkur
                          ? `${berkas.petugasUkur.nama} (${berkas.petugasUkur.nip})`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">PU Lapang</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.puLapang ? `${berkas.puLapang.nama} (${berkas.puLapang.nip})` : '-'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">No. STP</h3>
                      <p className="mt-1 text-sm text-gray-900">{berkas.noSTP || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tanggal STP</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {berkas.tglSTP ? new Date(berkas.tglSTP).toLocaleDateString('id-ID') : '-'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">No. SHAT/NIBEL</h3>
                      <p className="mt-1 text-sm text-gray-900">{berkas.noSHATNIBEL || '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: History Berkas */}
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
                              <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
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
            <BerkasCatatanTab berkasId={id} initialDeskripsi={berkas?.deskripsi} />
          )}
        </div>
      </div>
    </div>
  );
}
