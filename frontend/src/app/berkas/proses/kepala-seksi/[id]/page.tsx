'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, PageHeader, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';
import BerkasDetailTab from '@/components/berkas/BerkasDetailTab';
import BerkasHistoryTab from '@/components/berkas/BerkasHistoryTab';

type TabType = 'validasi' | 'detail' | 'history' | 'catatan';

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
  // Pengukuran
  petugasUkur?: {
    nama: string;
    nip: string;
  };
  puLapang?: {
    nama: string;
    nip: string;
  };
  noSTP?: string;
  tglSTP?: string;
  noSHATNIBEL?: string;
  // Pemetaan
  petugasPemetaan?: {
    nama: string;
    nip: string;
  };
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
  // KKS
  petugasKKS?: {
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

type DecisionType = '' | 'ACC' | 'REVISI';

export default function DetailKepalaSeksiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('validasi');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: berkas, isLoading } = useBerkasDetail(id);
  const { invalidateBerkas } = useCacheInvalidation();

  // Form state
  const [decision, setDecision] = useState<DecisionType>('');
  const [notes, setNotes] = useState('');
  const [revisionTarget, setRevisionTarget] = useState('');
  const [revisionReason, setRevisionReason] = useState('');

  useEffect(() => {
    if (berkas) {
      // Form initialized from berkas data via React Query
    }
  }, [berkas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision) {
      setError('Silakan pilih keputusan: ACC atau REVISI');
      return;
    }

    if (decision === 'REVISI') {
      if (!revisionTarget) {
        setError('Silakan pilih target revisi');
        return;
      }
      if (!revisionReason.trim()) {
        setError('Alasan revisi harus diisi');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (decision === 'ACC') {
        // Approve berkas
        await apiClient.post(`/berkas/workflow/${id}/kepala-seksi/approve`, {
          notes: notes || undefined,
        });
        setSuccess('Berkas telah disetujui (ACC) dan ditandai SELESAI.');
      } else {
        // Revise berkas
        await apiClient.post(`/berkas/workflow/${id}/kepala-seksi/revise`, {
          revisionTarget,
          reason: revisionReason,
        });
        setSuccess('Berkas telah dikembalikan untuk revisi.');
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        invalidateBerkas();
        router.push('/berkas/proses/kepala-seksi');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process';
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
        <Link href="/berkas/proses/kepala-seksi">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  if ((berkas as any).status !== 'DI_KEPALA_SEKSI') {
    return (
      <div className="space-y-6">
        <Alert
          type="warning"
          title="Status Berkas Tidak Sesuai"
          message={`Berkas ini sudah dalam status "${(berkas as any).status}" dan tidak dapat diproses di halaman Kepala Seksi.`}
        />
        <Link href="/berkas/proses/kepala-seksi">
          <Button variant="outline">← Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kepala Seksi – Tinjauan Berkas"
        breadcrumbs={[
          { label: 'Berkas Dalam Proses', href: '/berkas/proses' },
          { label: 'Kepala Seksi', href: '/berkas/proses/kepala-seksi' },
          { label: 'Detail Berkas' },
        ]}
      />

      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Berhasil" message={success} />}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('validasi')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'validasi'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✓ Validasi
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'detail'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 Detail Berkas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 History
            </button>
            <button
              onClick={() => setActiveTab('catatan')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catatan'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Catatan
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'validasi' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Decision Form */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">🎯 Keputusan Kepala Seksi</h2>

                {/* Decision Options */}
                <div className="space-y-4 mb-6">
                  <p className="text-sm font-medium text-gray-700">
                    Pilih Keputusan <span className="text-red-500">*</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Option ACC */}
                    <label
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        decision === 'ACC'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        value="ACC"
                        checked={decision === 'ACC'}
                        onChange={(e) => setDecision(e.target.value as DecisionType)}
                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">✓ ACC (Disetujui)</p>
                        <p className="text-xs text-gray-600">Berkas akan ditandai SELESAI</p>
                      </div>
                    </label>

                    {/* Option REVISI */}
                    <label
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        decision === 'REVISI'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        value="REVISI"
                        checked={decision === 'REVISI'}
                        onChange={(e) => setDecision(e.target.value as DecisionType)}
                        className="w-5 h-5 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">↩ REVISI (Dikembalikan)</p>
                        <p className="text-xs text-gray-600">Kirim kembali untuk perbaikan</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ACC Notes */}
                {decision === 'ACC' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Catatan Persetujuan (Opsional)
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Tambahkan catatan persetujuan (opsional)"
                      />
                    </div>
                  </div>
                )}

                {/* Form Revisi */}
                {decision === 'REVISI' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                    <div>
                      <label
                        htmlFor="revisionTarget"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Kembalikan ke <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="revisionTarget"
                        value={revisionTarget}
                        onChange={(e) => setRevisionTarget(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="">-- Pilih target revisi --</option>
                        <option value="PETUGAS_UKUR">Petugas Ukur</option>
                        <option value="PETUGAS_PEMETAAN">Petugas Pemetaan</option>
                        <option value="KKS">KKS</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-600">
                        Pilih tahap mana berkas perlu diperbaiki
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="revisionReason"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Alasan Revisi <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="revisionReason"
                        value={revisionReason}
                        onChange={(e) => setRevisionReason(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        placeholder="Jelaskan apa yang perlu diperbaiki atau dilengkapi..."
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/berkas/proses/kepala-seksi">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving || !decision}
                  className={`${
                    decision === 'ACC'
                      ? 'bg-green-600 hover:bg-green-700'
                      : decision === 'REVISI'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-400'
                  } disabled:bg-gray-400`}
                >
                  {saving
                    ? 'Memproses...'
                    : decision === 'ACC'
                      ? '✓ Setujui Berkas'
                      : '↩ Kirim Revisi'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'detail' && <BerkasDetailTab berkas={berkas as any} />}

          {activeTab === 'history' && <BerkasHistoryTab history={(berkas as any)?.history} />}

          {activeTab === 'catatan' && <BerkasCatatanTab berkasId={id} />}
        </div>
      </div>
    </div>
  );
}
