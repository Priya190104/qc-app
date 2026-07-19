'use client';

import React from 'react';

// ─── Helper components ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-2.5 border-b border-gray-100">
      {children}
    </h3>
  );
}

function DataField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className={`mt-0.5 text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </dd>
    </div>
  );
}

function StaffField({ label, name, nip }: { label: string; name?: string; nip?: string }) {
  if (!name) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-sm font-medium text-gray-900">{name}</span>
        {nip && <span className="text-xs text-gray-400 font-mono">{nip}</span>}
      </dd>
    </div>
  );
}

function AttachmentCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex-shrink-0 w-9 h-9 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 font-mono truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BerkasForDetail {
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
  di302?: string;
  di305?: string;
  kks?: string;
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
  petugasUkur?: { nama: string; nip: string };
  puLapang?: { nama: string; nip: string };
  petugasPemetaan?: { nama: string; nip: string };
  petugasKKS?: { nama: string; nip: string };
  createdBy?: { firstName: string; lastName: string };
  createdAt?: string;
}

interface BerkasDetailTabProps {
  berkas: BerkasForDetail;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BerkasDetailTab({ berkas }: BerkasDetailTabProps) {
  const hasSurveyData = !!(
    berkas.petugasUkur ||
    berkas.puLapang ||
    berkas.noSTP ||
    berkas.tglSTP ||
    berkas.noSHATNIBEL
  );

  const hasMappingData = !!(
    berkas.petugasPemetaan ||
    berkas.luasHasilUkur ||
    berkas.nib ||
    berkas.jumlahBidang ||
    (berkas.bidangItems && berkas.bidangItems.length > 0)
  );

  const hasKKSData = !!berkas.petugasKKS;
  const hasAttachments = !!(berkas.di302 || berkas.di305 || berkas.kks);

  return (
    <div className="space-y-8">
      {/* Informasi Dasar */}
      <section>
        <SectionHeading>Informasi Dasar</SectionHeading>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          <DataField label="Nomor Berkas" value={berkas.nomor} mono />
          <DataField label="Tahun Berkas" value={berkas.tahunBerkas} />
          <DataField label="Tanggal Berkas" value={formatDate(berkas.tanggalBerkas)} />
          <DataField label="Nama Pemohon" value={berkas.namaPemohon} />
          <DataField label="Kegiatan" value={berkas.kegiatan} />
          <DataField label="Nama Prosedur" value={berkas.namaProsedur} />
          <DataField label="Desa" value={berkas.desa} />
          <DataField label="Kecamatan" value={berkas.kecamatan} />
          <DataField
            label="Luas Pendaftaran"
            value={
              berkas.luasPendaftaran ? `${berkas.luasPendaftaran.toLocaleString('id-ID')} m²` : null
            }
          />
        </dl>
      </section>

      {/* Data Pengukuran */}
      {hasSurveyData && (
        <section>
          <SectionHeading>Data Pengukuran</SectionHeading>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <StaffField
              label="Petugas Ukur"
              name={berkas.petugasUkur?.nama}
              nip={berkas.petugasUkur?.nip}
            />
            <StaffField label="PU Lapang" name={berkas.puLapang?.nama} nip={berkas.puLapang?.nip} />
            <DataField label="No. STP" value={berkas.noSTP} mono />
            <DataField label="Tanggal STP" value={formatDate(berkas.tglSTP)} />
            <DataField label="No. SHAT/NIBEL" value={berkas.noSHATNIBEL} mono />
          </dl>
        </section>
      )}

      {/* Data Pemetaan */}
      {hasMappingData && (
        <section>
          <SectionHeading>Data Pemetaan</SectionHeading>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 mb-5">
            <StaffField
              label="Petugas Pemetaan"
              name={berkas.petugasPemetaan?.nama}
              nip={berkas.petugasPemetaan?.nip}
            />
            <DataField label="Jumlah Bidang" value={berkas.jumlahBidang} />
          </dl>
          {berkas.bidangItems && berkas.bidangItems.length > 0 ? (
            <div className="space-y-3">
              {berkas.bidangItems.map((item, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Bidang {idx + 1}</p>
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                    <DataField
                      label="Luas Hasil Ukur"
                      value={
                        item.luasHasilUkur
                          ? `${item.luasHasilUkur.toLocaleString('id-ID')} m²`
                          : null
                      }
                    />
                    <DataField label="NIB" value={item.nib} mono />
                    <DataField label="NIBEL" value={item.nibel} mono />
                    <DataField label="No. SU" value={item.noSU} mono />
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                <DataField
                  label="Luas Hasil Ukur"
                  value={
                    berkas.luasHasilUkur
                      ? `${berkas.luasHasilUkur.toLocaleString('id-ID')} m²`
                      : null
                  }
                />
                <DataField label="NIB" value={berkas.nib} mono />
                <DataField label="NIBEL" value={berkas.nibel} mono />
                <DataField label="No. SU" value={berkas.noSU} mono />
              </dl>
            </div>
          )}
        </section>
      )}

      {/* Pemeriksaan KKS */}
      {hasKKSData && (
        <section>
          <SectionHeading>Pemeriksaan KKS</SectionHeading>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            <StaffField
              label="Koordinator KKS"
              name={berkas.petugasKKS?.nama}
              nip={berkas.petugasKKS?.nip}
            />
          </dl>
        </section>
      )}

      {/* Dokumen Terlampir */}
      {hasAttachments && (
        <section>
          <SectionHeading>Dokumen Terlampir</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AttachmentCard label="DI.302" value={berkas.di302} />
            <AttachmentCard label="DI.305" value={berkas.di305} />
            {berkas.kks && <AttachmentCard label="Referensi KKS" value={berkas.kks} />}
          </div>
        </section>
      )}

      {/* Metadata */}
      {(berkas.createdBy || berkas.createdAt) && (
        <section className="pt-2 border-t border-gray-100">
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            {berkas.createdBy && (
              <div>
                <dt className="text-xs font-medium text-gray-400">Dibuat oleh</dt>
                <dd className="mt-0.5 text-sm text-gray-600">
                  {`${berkas.createdBy.firstName} ${berkas.createdBy.lastName}`}
                </dd>
              </div>
            )}
            {berkas.createdAt && (
              <div>
                <dt className="text-xs font-medium text-gray-400">Tanggal dibuat</dt>
                <dd className="mt-0.5 text-sm text-gray-600">{formatDate(berkas.createdAt)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
