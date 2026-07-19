'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, PageHeader, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, usePetugasList, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';
import BerkasDetailTab from '@/components/berkas/BerkasDetailTab';
import BerkasHistoryTab from '@/components/berkas/BerkasHistoryTab';

interface Petugas {
  id: string;
  nama: string;
  nip: string;
  jabatan?: string;
  departemen?: string;
}

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
  petugasPemetaanId?: string;
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
  petugasUkur?: Petugas;
  puLapang?: Petugas;
  petugasPemetaan?: Petugas;
  // Revision tracking
  revisionCount?: number;
  lastRevisionReason?: string;
  lastRevisionFrom?: string;
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

type TabType = 'update' | 'detail' | 'history' | 'catatan';

export default function UpdateBerkasDataPemetaanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('update');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: berkas, isLoading } = useBerkasDetail(id);
  const { data: allPetugas, isLoading: loadingPetugas } = usePetugasList('Petugas Pemetaan');
  const petugasList: Petugas[] = allPetugas ?? [];
  const { invalidateBerkas } = useCacheInvalidation();

  // Form state - Operator Data Pemetaan hanya mengelola penugasan Petugas Pemetaan
  const [formData, setFormData] = useState({
    petugasPemetaanId: '',
  });

  useEffect(() => {
    if (berkas) {
      setFormData({
        petugasPemetaanId: (berkas as any).petugasPemetaanId || '',
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
        petugasPemetaanId: formData.petugasPemetaanId || undefined,
      };

      await apiClient.put(`/berkas/workflow/${id}/operator-pemetaan/update`, updateData);

      // Lanjutkan ke Petugas Pemetaan (ubah status berkas)
      await apiClient.post(`/berkas/workflow/${id}/operator-pemetaan/lanjutkan`);

      setSuccess('Data pemetaan berhasil diperbarui dan berkas telah dikirim ke Petugas Pemetaan');

      // Redirect to operator data pemetaan page after successful update
      setTimeout(() => {
        invalidateBerkas();
        router.push('/berkas/proses/operator-data-pemetaan');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update berkas';
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
        <Link href="/berkas/proses/operator-data-pemetaan">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  if ((berkas as any).status !== 'DI_OPERATOR_DATA_PEMETAAN') {
    return (
      <div className="space-y-6">
        <Alert
          type="warning"
          title="Status Berkas Tidak Sesuai"
          message={`Berkas ini sudah dalam status "${(berkas as any).status}" dan tidak dapat diproses di halaman Operator Data Pemetaan.`}
        />
        <Link href="/berkas/proses/operator-data-pemetaan">
          <Button variant="outline">← Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Pemetaan Berkas"
        breadcrumbs={[
          { label: 'Berkas Dalam Proses', href: '/berkas/proses' },
          { label: 'Operator Data Pemetaan', href: '/berkas/proses/operator-data-pemetaan' },
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  💡 <strong>Info:</strong> Pada tahap Operator Data Pemetaan, Anda mengelola
                  penugasan Petugas Pemetaan. Pengisian data hasil pemetaan (luas hasil ukur, NIB,
                  NIBEL, jumlah bidang, dan No. SU) dilakukan oleh Petugas Pemetaan.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Petugas Pemetaan */}
                <div>
                  <label
                    htmlFor="petugasPemetaanId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Petugas Pemetaan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="petugasPemetaanId"
                    name="petugasPemetaanId"
                    value={formData.petugasPemetaanId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingPetugas}
                    required
                  >
                    <option value="">
                      {loadingPetugas ? 'Memuat...' : '-- Pilih Petugas Pemetaan --'}
                    </option>
                    {petugasList.map((petugas) => (
                      <option key={petugas.id} value={petugas.id}>
                        {petugas.nama} ({petugas.nip})
                      </option>
                    ))}
                  </select>
                  {petugasList.length === 0 && !loadingPetugas && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Tidak ada petugas pemetaan aktif tersedia
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/berkas/proses/operator-data-pemetaan">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Data Pemetaan'}
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
