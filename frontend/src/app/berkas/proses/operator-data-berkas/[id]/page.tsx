'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { Petugas } from '@/types';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';

interface Berkas {
  id: string;
  nomor: string;
  namaPemohon?: string;
  tanggalBerkas?: string;
  kegiatan?: string;
  desa?: string;
  kecamatan?: string;
  status: string;
  petugasKKSId?: string;
  petugasKKS?: {
    nama: string;
    nip: string;
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
  deskripsi?: string;
  history?: BerkasHistory[];
  createdAt: string;
  updatedAt: string;
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
}

type TabType = 'pemilihan' | 'detail' | 'history' | 'catatan';

export default function PilihKKSPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('pemilihan');
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [kksList, setKksList] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedKKS, setSelectedKKS] = useState('');

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
          if (berkasData.petugasKKSId) {
            setSelectedKKS(berkasData.petugasKKSId);
          }
        }

        // Fetch petugas KKS - using /petugas endpoint with departemen filter
        const petugasResponse = await apiClient.get<ApiResponse<any>>('/petugas');

        let petugasData: Petugas[] = [];
        if (petugasResponse.data?.data?.data) {
          petugasData = Array.isArray(petugasResponse.data.data.data)
            ? petugasResponse.data.data.data
            : [];
        } else if (petugasResponse.data?.data) {
          petugasData = Array.isArray(petugasResponse.data.data) ? petugasResponse.data.data : [];
        }

        // Filter only KKS department
        const kksData = petugasData.filter((p) => p.departemen === 'KKS');
        setKksList(kksData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKKS) {
      setError('Silakan pilih KKS terlebih dahulu');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/berkas/workflow/${id}/assign-kks`, {
        petugasKKSId: selectedKKS,
      });

      setSuccess('KKS berhasil ditugaskan. Berkas telah diteruskan ke KKS.');

      // Refresh berkas data
      const berkasResponse = await apiClient.get<ApiResponse<Berkas>>(`/berkas/${id}`);
      const berkasData = berkasResponse.data?.data;
      if (berkasData) {
        setBerkas(berkasData);
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/berkas/proses/operator-data-berkas');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign KKS';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePrintTandaSerahTerima = () => {
    // Create print window with tanda serah terima
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup untuk mencetak');
      return;
    }

    const kksName = berkas?.petugasKKS?.nama || '-';
    const kksNip = berkas?.petugasKKS?.nip || '-';
    const todayDate = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tanda Serah Terima Berkas</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            padding: 40px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            text-transform: uppercase;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
          }
          .content {
            margin: 30px 0;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
          }
          .info-label {
            width: 200px;
            font-weight: bold;
          }
          .info-value {
            flex: 1;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
          .signature-line {
            margin-top: 80px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tanda Serah Terima Berkas</h1>
          <h2>Sistem Quality Control Berkas</h2>
        </div>
        
        <div class="content">
          <p>Pada hari ini, ${todayDate}, telah diserahkan berkas dengan rincian sebagai berikut:</p>
          
          <div class="info-row">
            <div class="info-label">Nomor Berkas</div>
            <div class="info-value">: ${berkas?.nomor || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Nama Pemohon</div>
            <div class="info-value">: ${berkas?.namaPemohon || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Kegiatan</div>
            <div class="info-value">: ${berkas?.kegiatan || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Lokasi</div>
            <div class="info-value">: ${berkas?.desa || '-'}, ${berkas?.kecamatan || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status</div>
            <div class="info-value">: Diserahkan ke KKS</div>
          </div>
          <div class="info-row">
            <div class="info-label">KKS yang Ditugaskan</div>
            <div class="info-value">: ${kksName} (${kksNip})</div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p>Yang Menyerahkan,</p>
            <p style="margin-top: 10px; font-style: italic;">(Operator Data Berkas)</p>
            <div class="signature-line">
              ______________________
            </div>
          </div>
          <div class="signature-box">
            <p>Yang Menerima,</p>
            <p style="margin-top: 10px; font-style: italic;">(KKS)</p>
            <div class="signature-line">
              ${kksName}
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
        <Link href="/berkas/proses/operator-data-berkas">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  const isKKSAssigned = berkas.status === 'DI_KKS' && berkas.petugasKKS;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/berkas/proses/operator-data-berkas">
          <Button variant="outline" size="sm">
            ← Kembali
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Pemilihan KKS</h1>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            berkas.status === 'DI_KKS'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {berkas.status === 'DI_KKS' ? 'Di KKS' : 'Pemilihan KKS'}
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
            onClick={() => setActiveTab('pemilihan')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pemilihan'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎯 Pemilihan KKS
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detail'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Detail Berkas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📜 History
          </button>
          <button
            onClick={() => setActiveTab('catatan')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'pemilihan' && (
          <div className="space-y-6">
            {isKKSAssigned ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    ✓ KKS telah ditugaskan untuk berkas ini
                  </p>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-700">KKS yang Ditugaskan:</h3>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {berkas.petugasKKS?.nama}
                    </p>
                    <p className="text-sm text-gray-600">{berkas.petugasKKS?.nip}</p>
                  </div>
                </div>

                <Button
                  onClick={handlePrintTandaSerahTerima}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  🖨️ Cetak Tanda Serah Terima
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Pilih KKS (Koordinator Kelompok Substansi) yang akan menangani berkas ini
                  </p>
                </div>

                <div>
                  <label htmlFor="kksId" className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih KKS <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="kksId"
                    value={selectedKKS}
                    onChange={(e) => setSelectedKKS(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={saving}
                  >
                    <option value="">-- Pilih KKS --</option>
                    {kksList.map((kks) => (
                      <option key={kks.id} value={kks.id}>
                        {kks.nama} - {kks.nip}
                      </option>
                    ))}
                  </select>
                  {kksList.length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      Tidak ada petugas dengan departemen KKS ditemukan
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/berkas/proses/operator-data-berkas" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Batal
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={saving || !selectedKKS}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Memproses...' : '✓ Tugaskan KKS'}
                  </Button>
                </div>
              </form>
            )}
          </div>
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
            </div>

            {/* Data Pengukuran */}
            {(berkas.petugasUkur || berkas.puLapang || berkas.noSTP) && (
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
                    <p className="mt-1 text-sm text-gray-900">{formatDate(berkas.tglSTP)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">No. SHAT/NIBEL</h3>
                    <p className="mt-1 text-sm text-gray-900">{berkas.noSHATNIBEL || '-'}</p>
                  </div>
                </div>
              </>
            )}

            {/* Data Pemetaan */}
            {(berkas.petugasPemetaan || berkas.luasHasilUkur || berkas.nib) && (
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
