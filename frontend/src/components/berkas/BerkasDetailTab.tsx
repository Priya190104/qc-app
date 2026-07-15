'use client';

import React from 'react';

interface Berkas {
  nomor: string;
  namaPemohon?: string;
  tanggalBerkas?: string;
  kegiatan?: string;
  desa?: string;
  kecamatan?: string;
  kks?: string;
  status: string;
  // KKS Workflow Fields
  petugasUkur?: {
    nama: string;
    nip: string;
  };
  puLapang?: {
    nama: string;
    nip: string;
  };
  petugasPemetaan?: {
    nama: string;
    nip: string;
  };
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
  // Additional fields
  tahunBerkas?: number;
  namaProsedur?: string;
  luasPendaftaran?: number;
  di302?: string;
  di305?: string;
}

interface BerkasDetailTabProps {
  berkas: Berkas;
}

export default function BerkasDetailTab({ berkas }: BerkasDetailTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information */}
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
            {berkas.luasPendaftaran ? `${berkas.luasPendaftaran.toLocaleString('id-ID')} m²` : '-'}
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

      {/* Workflow Data - KKS Fields */}
      {(berkas.petugasUkur ||
        berkas.puLapang ||
        berkas.noSTP ||
        berkas.noSHATNIBEL ||
        berkas.luasHasilUkur ||
        berkas.nib ||
        berkas.nibel ||
        berkas.jumlahBidang ||
        berkas.noSU) && (
        <>
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pengukuran & Pemetaan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {berkas.petugasUkur && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Petugas Ukur</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {berkas.petugasUkur.nama} ({berkas.petugasUkur.nip})
                </p>
              </div>
            )}
            {berkas.puLapang && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">PU Lapang</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {berkas.puLapang.nama} ({berkas.puLapang.nip})
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
                  {(() => {
                    try {
                      const date = new Date(berkas.tglSTP);
                      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID');
                    } catch {
                      return '-';
                    }
                  })()}
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

          {/* Data Pemetaan */}
          {(berkas.petugasPemetaan ||
            berkas.jumlahBidang ||
            berkas.luasHasilUkur ||
            berkas.nib ||
            berkas.noSU) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {berkas.petugasPemetaan && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Petugas Pemetaan</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {berkas.petugasPemetaan.nama} ({berkas.petugasPemetaan.nip})
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jumlah Bidang</h3>
                  <p className="mt-1 text-sm font-semibold text-purple-700">
                    {berkas.jumlahBidang || '-'}
                  </p>
                </div>
              </div>
              {berkas.bidangItems && berkas.bidangItems.length > 0 ? (
                <div className="space-y-3">
                  {berkas.bidangItems.map((item, idx) => (
                    <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">
                        Bidang {idx + 1}
                      </h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Luas Hasil Ukur</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {item.luasHasilUkur
                              ? `${item.luasHasilUkur.toLocaleString('id-ID')} m²`
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">NIB</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {item.nib || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">NIBEL</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {item.nibel || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">No. SU</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-900">
                            {item.noSU || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Luas Hasil Ukur</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">
                        {berkas.luasHasilUkur
                          ? `${berkas.luasHasilUkur.toLocaleString('id-ID')} m²`
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">NIB</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">
                        {berkas.nib || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">NIBEL</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">
                        {berkas.nibel || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">No. SU</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">
                        {berkas.noSU || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
