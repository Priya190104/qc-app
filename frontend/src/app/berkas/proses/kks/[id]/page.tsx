'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useBerkasDetail, useCacheInvalidation } from '@/hooks/useQueryHooks';
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
  status: string;
  kksUser?: {
    firstName: string;
    lastName: string;
  };
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

type TabType = 'validasi' | 'detail' | 'history' | 'catatan';
type DecisionType = '' | 'ACC' | 'REVISI';

export default function ValidasiBerkasKKSPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('validasi');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: berkas, isLoading } = useBerkasDetail(id);
  const { invalidateBerkas } = useCacheInvalidation();

  // Form state
  const [decision, setDecision] = useState<DecisionType>('');
  const [notes, setNotes] = useState('');
  const [revisionTarget, setRevisionTarget] = useState('');
  const [revisionReason, setRevisionReason] = useState('');

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

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (decision === 'ACC') {
        // Approve berkas
        await apiClient.post(`/berkas/workflow/${id}/kks/approve`, {
          notes: notes || undefined,
        });
        setSuccess('Berkas telah disetujui (ACC). Berkas dilanjutkan ke Kepala Seksi.');
      } else {
        // Revise berkas
        await apiClient.post(`/berkas/workflow/${id}/kks/revise`, {
          revisionTarget,
          reason: revisionReason,
        });
        setSuccess('Berkas telah dikembalikan untuk revisi.');
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        invalidateBerkas();
        router.push('/berkas/proses/kks');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!berkas) {
    return (
      <div className="space-y-6">
        <Alert type="error" title="Error" message="Berkas tidak ditemukan" />
        <Link href="/berkas/proses/kks">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  if ((berkas as any).status !== 'DI_KKS') {
    return (
      <div className="space-y-6">
        <Alert
          type="warning"
          title="Status Berkas Tidak Sesuai"
          message={`Berkas ini sudah dalam status "${(berkas as any).status}" dan tidak dapat diproses di halaman KKS.`}
        />
        <Link href="/berkas/proses/kks">
          <Button variant="outline">← Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses/kks">
          <Button variant="outline" size="sm">
            ← Kembali
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">🎯 Validasi Berkas KKS</h1>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
          Di KKS
        </span>
        <span className="text-gray-600">No. Berkas: {berkas.nomor}</span>
      </div>

      {/* Error and Success Alerts */}
      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Success" message={success} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('validasi')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'validasi'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ✓ Validasi Berkas
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detail'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Detail Berkas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📜 History
          </button>
          <button
            onClick={() => setActiveTab('catatan')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catatan'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📝 Catatan
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'validasi' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                🔍 Pemeriksaan Berkas oleh KKS
              </h3>
              <p className="text-sm text-purple-700">
                Silakan periksa kelengkapan dan kebenaran berkas, kemudian berikan keputusan Anda.
              </p>
            </div>

            {/* Pertanyaan Utama */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Apakah berkas sudah benar dan lengkap?
              </h3>

              <div className="space-y-3">
                {/* Option ACC */}
                <label className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="decision"
                    value="ACC"
                    checked={decision === 'ACC'}
                    onChange={(e) => setDecision(e.target.value as DecisionType)}
                    className="mt-1 w-5 h-5 text-green-600"
                  />
                  <div className="ml-3">
                    <span className="block text-lg font-semibold text-gray-900">
                      ✓ ACC (Disetujui)
                    </span>
                    <span className="block text-sm text-gray-600 mt-1">
                      Berkas sudah benar dan lengkap. Lanjutkan ke Kepala Seksi untuk persetujuan
                      akhir.
                    </span>
                  </div>
                </label>

                {/* Option REVISI */}
                <label className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-500 transition-colors">
                  <input
                    type="radio"
                    name="decision"
                    value="REVISI"
                    checked={decision === 'REVISI'}
                    onChange={(e) => setDecision(e.target.value as DecisionType)}
                    className="mt-1 w-5 h-5 text-red-600"
                  />
                  <div className="ml-3">
                    <span className="block text-lg font-semibold text-gray-900">
                      ↩ REVISI (Dikembalikan)
                    </span>
                    <span className="block text-sm text-gray-600 mt-1">
                      Berkas perlu diperbaiki atau dilengkapi. Kembalikan ke tahap sebelumnya.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Catatan untuk ACC */}
            {decision === 'ACC' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/berkas/proses/kks">
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
                    ? '✓ ACC - Lanjutkan ke Kepala Seksi'
                    : decision === 'REVISI'
                      ? '↩ Kirim Revisi'
                      : 'Pilih Keputusan'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'detail' && <BerkasDetailTab berkas={berkas as any} />}

        {activeTab === 'history' && <BerkasHistoryTab history={(berkas as any)?.history} />}

        {activeTab === 'catatan' && <BerkasCatatanTab berkasId={id} />}
      </div>
    </div>
  );
}
