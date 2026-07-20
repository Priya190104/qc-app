'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Alert, PageHeader, SectionLoader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { Petugas } from '@/types';
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
  status: string;
  petugasKKSId?: string;
  petugasKKS?: {
    nama: string;
    nip: string;
  };
  tahunBerkas?: number;
  namaProsedur?: string;
  luasPendaftaran?: number;
  di302?: string;
  di305?: string;
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

type TabType = 'pemilihan' | 'detail' | 'history' | 'catatan';

export default function PilihKKSPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('pemilihan');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedKKS, setSelectedKKS] = useState('');

  const { data: berkas, isLoading } = useBerkasDetail(id);
  const { data: kksList = [] } = usePetugasList('KKS');
  const { invalidateBerkas } = useCacheInvalidation();

  useEffect(() => {
    if (berkas && (berkas as any).petugasKKSId) {
      setSelectedKKS((berkas as any).petugasKKSId);
    }
  }, [berkas]);

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
      invalidateBerkas();

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
          .section-title {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #666;
            margin: 20px 0 10px 0;
            padding-bottom: 4px;
          }
          .content {
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            margin: 6px 0;
          }
          .info-label {
            width: 220px;
            font-weight: bold;
            flex-shrink: 0;
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

          <div class="section-title">Informasi Umum Berkas</div>
          <div class="info-row">
            <div class="info-label">Nomor Berkas</div>
            <div class="info-value">: ${berkas?.nomor || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Nama Pemohon</div>
            <div class="info-value">: ${berkas?.namaPemohon || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Tanggal Berkas</div>
            <div class="info-value">: ${berkas?.tanggalBerkas ? new Date(berkas.tanggalBerkas).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Tahun Berkas</div>
            <div class="info-value">: ${berkas?.tahunBerkas || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Kegiatan</div>
            <div class="info-value">: ${berkas?.kegiatan || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Prosedur</div>
            <div class="info-value">: ${berkas?.namaProsedur || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Lokasi</div>
            <div class="info-value">: ${berkas?.desa || '-'}, ${berkas?.kecamatan || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Luas Pendaftaran (m²)</div>
            <div class="info-value">: ${berkas?.luasPendaftaran != null ? berkas.luasPendaftaran.toLocaleString('id-ID') : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">DI 302</div>
            <div class="info-value">: ${berkas?.di302 || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">DI 305</div>
            <div class="info-value">: ${berkas?.di305 || '-'}</div>
          </div>

          <div class="section-title">Data Pengukuran</div>
          <div class="info-row">
            <div class="info-label">Petugas Ukur</div>
            <div class="info-value">: ${berkas?.petugasUkur ? berkas.petugasUkur.nama + ' (' + berkas.petugasUkur.nip + ')' : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">PU Lapang</div>
            <div class="info-value">: ${berkas?.puLapang ? berkas.puLapang.nama + ' (' + berkas.puLapang.nip + ')' : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">No. STP</div>
            <div class="info-value">: ${berkas?.noSTP || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Tgl. STP</div>
            <div class="info-value">: ${berkas?.tglSTP ? new Date(berkas.tglSTP).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">No. SHAT/NIBEL</div>
            <div class="info-value">: ${berkas?.noSHATNIBEL || '-'}</div>
          </div>

          <div class="section-title">Data Pemetaan</div>
          <div class="info-row">
            <div class="info-label">Petugas Pemetaan</div>
            <div class="info-value">: ${berkas?.petugasPemetaan ? berkas.petugasPemetaan.nama + ' (' + berkas.petugasPemetaan.nip + ')' : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Luas Hasil Ukur (m²)</div>
            <div class="info-value">: ${berkas?.luasHasilUkur != null ? berkas.luasHasilUkur.toLocaleString('id-ID') : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">NIB</div>
            <div class="info-value">: ${berkas?.nib || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">NIBEL</div>
            <div class="info-value">: ${berkas?.nibel || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">No. SU</div>
            <div class="info-value">: ${berkas?.noSU || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Jumlah Bidang</div>
            <div class="info-value">: ${berkas?.jumlahBidang != null ? berkas.jumlahBidang : '-'}</div>
          </div>

          <div class="section-title">Penugasan KKS</div>
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

  if (isLoading) {
    return <SectionLoader />;
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

  if ((berkas as any).status !== 'PEMILIHAN_KKS') {
    return (
      <div className="space-y-6">
        <Alert
          type="warning"
          title="Status Berkas Tidak Sesuai"
          message={`Berkas ini sudah dalam status "${(berkas as any).status}" dan tidak dapat diproses di halaman Operator Data Berkas.`}
        />
        <Link href="/berkas/proses/operator-data-berkas">
          <Button variant="outline">← Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const isKKSAssigned = berkas.status === 'DI_KKS' && berkas.petugasKKS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemilihan KKS"
        breadcrumbs={[
          { label: 'Berkas Dalam Proses', href: '/berkas/proses' },
          { label: 'Operator Data Berkas', href: '/berkas/proses/operator-data-berkas' },
          { label: 'Detail Berkas' },
        ]}
      />

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

        {activeTab === 'detail' && <BerkasDetailTab berkas={berkas as any} />}

        {activeTab === 'history' && <BerkasHistoryTab history={(berkas as any)?.history} />}

        {activeTab === 'catatan' && (
          <BerkasCatatanTab berkasId={id} initialDeskripsi={berkas?.deskripsi} />
        )}
      </div>
    </div>
  );
}
