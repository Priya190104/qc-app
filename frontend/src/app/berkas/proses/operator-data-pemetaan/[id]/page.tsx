'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';

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

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

type TabType = 'update' | 'detail' | 'history' | 'catatan';

export default function UpdateBerkasDataPemetaanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('update');
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [loadingPetugas, setLoadingPetugas] = useState(false);

  // Form state - Operator Data Pemetaan mengelola field pemetaan dan detail teknis
  const [formData, setFormData] = useState({
    petugasPemetaanId: '',
    luasHasilUkur: '',
    nib: '',
    nibel: '',
    jumlahBidang: '',
    noSU: '',
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
          // Populate form with existing data
          setFormData({
            petugasPemetaanId: berkasData.petugasPemetaanId || '',
            luasHasilUkur: berkasData.luasHasilUkur?.toString() || '',
            nib: berkasData.nib || '',
            nibel: berkasData.nibel || '',
            jumlahBidang: berkasData.jumlahBidang?.toString() || '',
            noSU: berkasData.noSU || '',
          });
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchPetugas = async () => {
      try {
        setLoadingPetugas(true);
        const response = await apiClient.get<ApiResponse<{ data: Petugas[] }>>(
          '/petugas?departemen=Petugas Pemetaan&isActive=true'
        );
        setPetugasList(response.data?.data?.data || []);
      } catch (err: any) {
        console.error('Failed to load petugas:', err);
      } finally {
        setLoadingPetugas(false);
      }
    };

    if (id) {
      fetchData();
      fetchPetugas();
    }
  }, [id]);

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
        luasHasilUkur: formData.luasHasilUkur ? parseInt(formData.luasHasilUkur) : undefined,
        nib: formData.nib || undefined,
        nibel: formData.nibel || undefined,
        jumlahBidang: formData.jumlahBidang ? parseInt(formData.jumlahBidang) : undefined,
        noSU: formData.noSU || undefined,
      };

      await apiClient.put(`/berkas/workflow/${id}/operator-pemetaan/update`, updateData);

      // Lanjutkan ke Petugas Pemetaan (ubah status berkas)
      await apiClient.post(`/berkas/workflow/${id}/operator-pemetaan/lanjutkan`);

      setSuccess('Data pemetaan berhasil diperbarui dan berkas telah dikirim ke Petugas Pemetaan');

      // Redirect to operator data pemetaan page after successful update
      setTimeout(() => {
        router.push('/berkas/proses/operator-data-pemetaan');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update berkas';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
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
        <Link href="/berkas/proses/operator-data-pemetaan">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses/operator-data-pemetaan">
          <Button variant="outline">← Kembali</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">🗺️ Data Pemetaan Berkas</h1>
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  💡 <strong>Info:</strong> Pada tahap Operator Data Pemetaan, Anda mengelola
                  penugasan Petugas Pemetaan dan detail teknis hasil pemetaan seperti luas hasil
                  ukur, NIB, NIBEL, jumlah bidang, dan No. SU.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Petugas Pemetaan */}
                <div className="md:col-span-2">
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

                {/* Luas Hasil Ukur */}
                <div>
                  <label
                    htmlFor="luasHasilUkur"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Luas Hasil Ukur (m²)
                  </label>
                  <input
                    type="number"
                    id="luasHasilUkur"
                    name="luasHasilUkur"
                    value={formData.luasHasilUkur}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* NIB */}
                <div>
                  <label htmlFor="nib" className="block text-sm font-medium text-gray-700 mb-2">
                    NIB
                  </label>
                  <input
                    type="text"
                    id="nib"
                    name="nib"
                    value={formData.nib}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan NIB"
                  />
                </div>

                {/* NIBEL */}
                <div>
                  <label htmlFor="nibel" className="block text-sm font-medium text-gray-700 mb-2">
                    NIBEL
                  </label>
                  <input
                    type="text"
                    id="nibel"
                    name="nibel"
                    value={formData.nibel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan NIBEL"
                  />
                </div>

                {/* Jumlah Bidang */}
                <div>
                  <label
                    htmlFor="jumlahBidang"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Jumlah Bidang
                  </label>
                  <input
                    type="number"
                    id="jumlahBidang"
                    name="jumlahBidang"
                    value={formData.jumlahBidang}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* No. SU */}
                <div>
                  <label htmlFor="noSU" className="block text-sm font-medium text-gray-700 mb-2">
                    No. SU
                  </label>
                  <input
                    type="text"
                    id="noSU"
                    name="noSU"
                    value={formData.noSU}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan No. SU"
                  />
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
          {activeTab === 'detail' && (
            <div className="space-y-6">
              {/* Informasi Dasar Berkas */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  📋 Informasi Dasar Berkas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nomor Berkas</h3>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{berkas.nomor}</p>
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
                          return isNaN(date.getTime())
                            ? '-'
                            : date.toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              });
                        } catch {
                          return '-';
                        }
                      })()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tahun Berkas</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.tahunBerkas || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Kegiatan</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.kegiatan || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nama Prosedur</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.namaProsedur || '-'}</p>
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
                    <h3 className="text-sm font-medium text-gray-500">Luas Pendaftaran</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {berkas.luasPendaftaran
                        ? `${berkas.luasPendaftaran.toLocaleString('id-ID')} m²`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          berkas.status === 'SELESAI'
                            ? 'bg-green-100 text-green-700'
                            : berkas.status === 'DI_KKS'
                              ? 'bg-purple-100 text-purple-700'
                              : berkas.status === 'DI_KEPALA_SEKSI'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {berkas.status.replace(/_/g, ' ')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Pengukuran */}
              {(berkas.petugasUkur || berkas.puLapang || berkas.noSTP || berkas.noSHATNIBEL) && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    📏 Data Pengukuran
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {berkas.petugasUkur && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Petugas Ukur</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {berkas.petugasUkur.nama}
                          <span className="text-gray-500 text-xs ml-2">
                            ({berkas.petugasUkur.nip})
                          </span>
                        </p>
                      </div>
                    )}
                    {berkas.puLapang && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">PU Lapang</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {berkas.puLapang.nama}
                          <span className="text-gray-500 text-xs ml-2">
                            ({berkas.puLapang.nip})
                          </span>
                        </p>
                      </div>
                    )}
                    {berkas.noSTP && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">No. STP</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.noSTP}</p>
                      </div>
                    )}
                    {berkas.tglSTP && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Tanggal STP</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(berkas.tglSTP).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    {berkas.noSHATNIBEL && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">No. SHAT/NIBEL</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.noSHATNIBEL}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Pemetaan */}
              {(berkas.petugasPemetaan ||
                berkas.luasHasilUkur ||
                berkas.nib ||
                berkas.nibel ||
                berkas.jumlahBidang ||
                berkas.noSU) && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    🗺️ Data Pemetaan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {berkas.petugasPemetaan && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Petugas Pemetaan</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {berkas.petugasPemetaan.nama}
                          <span className="text-gray-500 text-xs ml-2">
                            ({berkas.petugasPemetaan.nip})
                          </span>
                        </p>
                      </div>
                    )}
                    {berkas.luasHasilUkur && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Luas Hasil Ukur</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {berkas.luasHasilUkur.toLocaleString('id-ID')} m²
                        </p>
                      </div>
                    )}
                    {berkas.nib && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">NIB</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.nib}</p>
                      </div>
                    )}
                    {berkas.nibel && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">NIBEL</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.nibel}</p>
                      </div>
                    )}
                    {berkas.jumlahBidang && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Jumlah Bidang</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.jumlahBidang}</p>
                      </div>
                    )}
                    {berkas.noSU && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">No. SU</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.noSU}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informasi Revisi (jika ada) */}
              {((berkas.revisionCount && berkas.revisionCount > 0) ||
                berkas.lastRevisionReason) && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    🔄 Informasi Revisi
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {berkas.revisionCount && berkas.revisionCount > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Jumlah Revisi</h3>
                        <p className="mt-1 text-sm text-gray-900">{berkas.revisionCount} kali</p>
                      </div>
                    )}
                    {berkas.lastRevisionFrom && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Revisi Dari</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {berkas.lastRevisionFrom.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                    {berkas.lastRevisionReason && (
                      <div className="md:col-span-3">
                        <h3 className="text-sm font-medium text-gray-500">
                          Alasan Revisi Terakhir
                        </h3>
                        <p className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded-md">
                          {berkas.lastRevisionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informasi Waktu */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  ⏱️ Informasi Waktu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dibuat Pada</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(berkas.createdAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Terakhir Diperbarui</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(berkas.updatedAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
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
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
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
