'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
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
  createdAt: string;
  updatedAt: string;
  // Additional fields
  tahunBerkas?: number;
  namaProsedur?: string;
  luasPendaftaran?: number;
  // Pengukuran fields
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
  // Pemetaan fields
  petugasPemetaanId?: string;
  petugasPemetaan?: {
    id: string;
    nama: string;
    nip: string;
  };
  luasHasilUkur?: number;
  nib?: string;
  nibel?: string;
  jumlahBidang?: number;
  noSU?: string;
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

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

type TabType = 'validasi' | 'detail' | 'history' | 'catatan';

export default function ValidasiBerkasPetugasPemetaanPage() {
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('validasi');
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - Petugas Pemetaan melakukan validasi pemetaan
  const [formData, setFormData] = useState({
    sudahDilakukanPemetaan: false,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch berkas details
        const berkasResponse = await apiClient.get<ApiResponse<Berkas>>(`/berkas/${id}`);
        const berkasData = berkasResponse.data?.data;

        if (berkasData) {
          setBerkas(berkasData);
          // Initialize form
          setFormData({
            sudahDilakukanPemetaan: false,
            notes: '',
          });
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: must confirm pemetaan has been done
    if (!formData.sudahDilakukanPemetaan) {
      setError('Anda harus mengkonfirmasi bahwa pemetaan telah dilakukan');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        notes: formData.notes || undefined,
      };

      // Use workflow API untuk validasi pemetaan
      await apiClient.post(`/berkas/workflow/${id}/petugas-pemetaan/validate`, updateData);
      setSuccess('Pemetaan berkas berhasil divalidasi dan dilanjutkan ke Pemilihan KKS');

      // Redirect back to list after success
      setTimeout(() => {
        window.location.href = '/berkas/proses/petugas-pemetaan';
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to validate berkas';
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

  const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      DI_PETUGAS_PEMETAAN: 'bg-purple-100 text-purple-800',
      PEMILIHAN_KKS: 'bg-blue-100 text-blue-800',
      DI_KKS: 'bg-yellow-100 text-yellow-800',
      DI_KEPALA_SEKSI: 'bg-orange-100 text-orange-800',
      SELESAI: 'bg-green-100 text-green-800',
      REVISI: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labelMap: Record<string, string> = {
      DI_PETUGAS_PEMETAAN: 'Di Petugas Pemetaan',
      PEMILIHAN_KKS: 'Pemilihan KKS',
      DI_KKS: 'Di KKS',
      DI_KEPALA_SEKSI: 'Di Kepala Seksi',
      SELESAI: 'Selesai',
      REVISI: 'Revisi',
    };
    return labelMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!berkas) {
    return (
      <div className="space-y-6">
        <Alert type="error" title="Error" message="Berkas tidak ditemukan" />
        <Link href="/berkas/proses/petugas-pemetaan">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses/petugas-pemetaan">
          <Button variant="outline" size="sm">
            ← Kembali
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Validasi Pemetaan Berkas</h1>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
            berkas.status
          )}`}
        >
          {getStatusLabel(berkas.status)}
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
            📋 Validasi Pemetaan
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
              <h3 className="text-lg font-semibold text-purple-900 mb-2">🗺️ Validasi Pemetaan</h3>
              <p className="text-sm text-purple-700">
                Konfirmasi bahwa pemetaan telah dilakukan dan berikan catatan jika diperlukan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Checkbox: Apakah sudah dilakukan pemetaan? */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sudahDilakukanPemetaan"
                    checked={formData.sudahDilakukanPemetaan}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="block text-base font-semibold text-gray-900">
                      Apakah sudah dilakukan pemetaan? <span className="text-red-500">*</span>
                    </span>
                    <span className="block text-sm text-gray-600 mt-1">
                      Centang kotak ini untuk mengkonfirmasi bahwa proses pemetaan telah selesai
                      dilakukan
                    </span>
                  </div>
                </label>
              </div>

              {/* Catatan Validasi */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tambahkan catatan atau komentar tentang hasil pemetaan (opsional)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Catatan ini akan disimpan dalam history berkas
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/berkas/proses/petugas-pemetaan">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving || !formData.sudahDilakukanPemetaan}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
              >
                {saving ? 'Memproses...' : '✓ Validasi & Lanjutkan ke Pemilihan KKS'}
              </Button>
            </div>
          </form>
        )}

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
                <p className="mt-1 text-sm text-gray-900">{formatDate(berkas.tanggalBerkas)}</p>
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
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${getStatusBadgeClass(berkas.status)}`}
                  >
                    {getStatusLabel(berkas.status)}
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
                      {berkas.tglSTP ? formatDate(berkas.tglSTP) : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">No. SHAT/NIBEL</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.noSHATNIBEL || '-'}</p>
                  </div>
                </div>
              </>
            )}

            {/* Data Pemetaan */}
            {(berkas.petugasPemetaan ||
              berkas.luasHasilUkur ||
              berkas.nib ||
              berkas.nibel ||
              berkas.jumlahBidang ||
              berkas.noSU) && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pemetaan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Petugas Pemetaan</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {berkas.petugasPemetaan
                        ? `${berkas.petugasPemetaan.nama} (${berkas.petugasPemetaan.nip})`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Luas Hasil Ukur</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {berkas.luasHasilUkur
                        ? `${berkas.luasHasilUkur.toLocaleString('id-ID')} m²`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">NIB</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.nib || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">NIBEL</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.nibel || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Jumlah Bidang</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.jumlahBidang || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">No. SU</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.noSU || '-'}</p>
                  </div>
                </div>
              </>
            )}
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
                                <p className="mt-1 text-sm text-gray-500">Alasan: {item.reason}</p>
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
  );
}
