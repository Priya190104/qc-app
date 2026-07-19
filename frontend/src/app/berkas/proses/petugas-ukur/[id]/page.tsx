'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, PageHeader, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, usePetugasList, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';
import BerkasDetailTab from '@/components/berkas/BerkasDetailTab';
import BerkasHistoryTab from '@/components/berkas/BerkasHistoryTab';

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

      const currentStatus = (berkas as any)?.status;
      // Use workflow API untuk validasi pengukuran
      await apiClient.post(`/berkas/workflow/${id}/petugas-ukur/validate`, updateData);
      if (currentStatus === 'REVISI_KKS') {
        setSuccess('Revisi pengukuran selesai. Berkas dikembalikan ke KKS.');
      } else if (currentStatus === 'REVISI_KASI') {
        setSuccess('Revisi pengukuran selesai. Berkas dikembalikan ke Kepala Seksi.');
      } else {
        setSuccess(
          'Pengukuran berkas berhasil divalidasi dan dilanjutkan ke Operator Data Pemetaan'
        );
      }

      // Redirect back to list after success
      setTimeout(() => {
        invalidateBerkas();
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

  const validStatuses = ['DI_PETUGAS_UKUR', 'REVISI_KKS', 'REVISI_KASI'];
  if (!validStatuses.includes((berkas as any).status)) {
    return (
      <div className="space-y-6">
        <Alert
          type="warning"
          title="Status Berkas Tidak Sesuai"
          message={`Berkas ini sudah dalam status "${(berkas as any).status}" dan tidak dapat diproses di halaman Petugas Ukur.`}
        />
        <Link href="/berkas/proses/petugas-ukur">
          <Button variant="outline">← Kembali ke Daftar</Button>
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
