'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, usePetugasList, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';
import BerkasDetailTab from '@/components/berkas/BerkasDetailTab';
import BerkasHistoryTab from '@/components/berkas/BerkasHistoryTab';

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
  const { data: allPetugas, isLoading: loadingPetugas } = usePetugasList('Petugas Ukur');
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
        invalidateBerkas();
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
        invalidateBerkas();
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

  if ((berkas as any).status !== 'DI_OPERATOR_DATA_UKUR') {
    return (
      <div className="space-y-6">
        <Alert
          type="warning"
          title="Status Berkas Tidak Sesuai"
          message={`Berkas ini sudah dalam status "${(berkas as any).status}" dan tidak dapat diproses di halaman Operator Data Ukur.`}
        />
        <Link href="/berkas/proses/operator-data-ukur">
          <Button variant="outline">← Kembali ke Daftar</Button>
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
          {activeTab === 'detail' && <BerkasDetailTab berkas={berkas as any} />}

          {activeTab === 'history' && <BerkasHistoryTab history={(berkas as any)?.history} />}

          {activeTab === 'catatan' && (
            <BerkasCatatanTab berkasId={id} initialDeskripsi={berkas?.deskripsi} />
          )}
        </div>
      </div>
    </div>
  );
}
