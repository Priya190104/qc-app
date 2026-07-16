'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, usePetugasList, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';

// Helper function to format date for input[type="date"]
const formatDateForInput = (dateValue: any): string => {
  if (!dateValue) return '';

  try {
    // If it's already a string in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Parse the date
    const date = new Date(dateValue);

    // Check if valid date
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

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
  luasHasilUkur?: number;
  nib?: string;
  nibel?: string;
  jumlahBidang?: number;
  noSU?: string;
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

export default function UpdateBerkasDataUkurPage() {
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('update');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: berkas, isLoading } = useBerkasDetail(id);
  const { data: allPetugas } = usePetugasList('Petugas Ukur');
  const petugasList: Petugas[] = allPetugas ?? [];
  const { invalidateBerkas } = useCacheInvalidation();

  // Form state - Operator Data Ukur mengelola field teknis pengukuran
  const [formData, setFormData] = useState({
    petugasUkurId: '',
    noSTP: '',
    tglSTP: '',
    noSHATNIBEL: '',
  });

  useEffect(() => {
    if (berkas) {
      setFormData({
        petugasUkurId: (berkas as any).petugasUkurId || '',
        noSTP: (berkas as any).noSTP || '',
        tglSTP: formatDateForInput((berkas as any).tglSTP),
        noSHATNIBEL: (berkas as any).noSHATNIBEL || '',
      });
    }
  }, [berkas]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        petugasUkurId: formData.petugasUkurId || undefined,
        noSTP: formData.noSTP || undefined,
        tglSTP: formData.tglSTP || undefined,
        noSHATNIBEL: formData.noSHATNIBEL || undefined,
      };

      // Update data menggunakan workflow endpoint
      await apiClient.put(`/berkas/workflow/${id}/operator-ukur/update`, updateData);
      setSuccess('Data pengukuran berkas berhasil diperbarui');

      // Redirect to operator data ukur page after successful update
      setTimeout(() => {
        window.location.href = '/berkas/proses/operator-data-ukur';
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update berkas';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSendToPetugasUkur = async () => {
    if (!formData.petugasUkurId) {
      setError('Harap pilih Petugas Ukur terlebih dahulu');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Update data dulu
      const updateData: any = {
        petugasUkurId: formData.petugasUkurId || undefined,
        noSTP: formData.noSTP || undefined,
        tglSTP: formData.tglSTP || undefined,
        noSHATNIBEL: formData.noSHATNIBEL || undefined,
      };

      await apiClient.put(`/berkas/workflow/${id}/operator-ukur/update`, updateData);

      // Lanjutkan ke Petugas Ukur
      await apiClient.post(`/berkas/workflow/${id}/operator-ukur/lanjutkan`);
      setSuccess('Berkas berhasil dikirim ke Petugas Ukur');

      // Redirect to operator data ukur page after successful send
      setTimeout(() => {
        window.location.href = '/berkas/proses/operator-data-ukur';
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send berkas';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!berkas) {
    return (
      <div className="space-y-6">
        <Alert type="error" title="Error" message="Berkas tidak ditemukan" />
        <Link href="/berkas/proses/operator-data-ukur">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses/operator-data-ukur">
          <Button variant="outline">← Kembali</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">📊 Data Pengukuran Berkas</h1>
      </div>

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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Perbarui Data
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`${
                activeTab === 'detail'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detail Berkas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              History Berkas
            </button>
            <button
              onClick={() => setActiveTab('catatan')}
              className={`${
                activeTab === 'catatan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              📝 Catatan
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Perbarui Data */}
          {activeTab === 'update' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Info:</strong> Pada tahap Operator Data Ukur, Anda menugaskan petugas
                  ukur dan mengelola data teknis seperti No. STP dan SHAT/NIBEL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Petugas Ukur */}
                <div>
                  <label
                    htmlFor="petugasUkurId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Petugas Ukur <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="petugasUkurId"
                    name="petugasUkurId"
                    value={formData.petugasUkurId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingPetugas}
                    required
                  >
                    <option value="">
                      {loadingPetugas ? 'Memuat...' : '-- Pilih Petugas Ukur --'}
                    </option>
                    {petugasList.map((petugas) => (
                      <option key={petugas.id} value={petugas.id}>
                        {petugas.nama} ({petugas.nip})
                      </option>
                    ))}
                  </select>
                  {petugasList.length === 0 && !loadingPetugas && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Tidak ada petugas ukur aktif tersedia
                    </p>
                  )}
                </div>

                {/* No. STP */}
                <div>
                  <label htmlFor="noSTP" className="block text-sm font-medium text-gray-700 mb-2">
                    No. STP
                  </label>
                  <input
                    type="text"
                    id="noSTP"
                    name="noSTP"
                    value={formData.noSTP}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan No. STP"
                  />
                </div>

                {/* Tgl STP */}
                <div>
                  <label htmlFor="tglSTP" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal STP
                  </label>
                  <input
                    type="date"
                    id="tglSTP"
                    name="tglSTP"
                    value={formData.tglSTP}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* No. SHAT/NIBEL */}
                <div>
                  <label
                    htmlFor="noSHATNIBEL"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    No. SHAT/NIBEL
                  </label>
                  <input
                    type="text"
                    id="noSHATNIBEL"
                    name="noSHATNIBEL"
                    value={formData.noSHATNIBEL}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan No. SHAT/NIBEL"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/berkas/proses/operator-data-ukur">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" variant="outline" disabled={saving || sending}>
                  {saving ? 'Menyimpan...' : 'Simpan Draft'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSendToPetugasUkur}
                  disabled={saving || sending || !formData.petugasUkurId}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? 'Mengirim...' : '📤 Kirim ke Petugas Ukur'}
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
                  <h3 className="text-sm font-medium text-gray-500">Koordinator (KKS)</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {berkas.kks ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-purple-100 text-purple-700 text-sm font-medium">
                        {berkas.kks}
                      </span>
                    ) : (
                      '-'
                    )}
                  </p>
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

              {/* Data Pengukuran & Pemetaan */}
              {(berkas.petugasUkur || berkas.noSTP || berkas.tglSTP || berkas.noSHATNIBEL) && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Data Pengukuran & Pemetaan
                    </h2>
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
            <BerkasCatatanTab berkasId={id} initialDeskripsi={berkas?.deskripsi} />
          )}
        </div>
      </div>
    </div>
  );
}
