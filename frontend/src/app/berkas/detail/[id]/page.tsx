'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, SectionLoader } from '@/components/ui';
import { useBerkasDetail, useCacheInvalidation } from '@/hooks/useQueryHooks';
import BerkasCatatanTab from '@/components/berkas/BerkasCatatanTab';
import EditBerkasModal from '@/components/modals/EditBerkasModal';
import { useAuthStore } from '@/stores';
import { getStatusConfig, WORKFLOW_STAGES } from '@/lib/constants/status';

// ─── Helper Components ────────────────────────────────────────────────────────

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

// ─── History Timeline ─────────────────────────────────────────────────────────

function HistoryTimeline({
  history,
}: {
  history?: Array<{
    id: string;
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    changedAt: string;
  }>;
}) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">Belum ada riwayat perubahan</p>
        <p className="text-xs text-gray-400 mt-1">Perubahan status berkas akan tercatat di sini</p>
      </div>
    );
  }

  return (
    <ol>
      {history.map((item, idx) => {
        const newCfg = getStatusConfig(item.newStatus ?? '');
        const isLast = idx === history.length - 1;
        const isRevision = newCfg.category === 'revision';
        const isDoneStatus = item.newStatus === 'SELESAI';
        const isClosedStatus = item.newStatus === 'DITUTUP';

        return (
          <li key={item.id} className="relative pl-11 pb-8 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200"
                aria-hidden="true"
              />
            )}
            <span
              className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${newCfg.dotColor}`}
            >
              {isDoneStatus ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : isClosedStatus ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : isRevision ? (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </span>

            <div className="pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {item.oldStatus && (
                  <>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusConfig(item.oldStatus).badge}`}
                    >
                      {getStatusConfig(item.oldStatus).label}
                    </span>
                    <svg
                      className="w-3 h-3 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${newCfg.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${newCfg.dotColor}`} />
                  {newCfg.label}
                </span>
              </div>

              {item.reason && (
                <div className="mt-1.5 px-3 py-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 italic">{item.reason}</p>
                </div>
              )}

              <time className="mt-1.5 block text-xs text-gray-400">
                {new Date(item.changedAt).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type TabType = 'detail' | 'history' | 'catatan';

interface Berkas {
  id: string;
  nomor: string;
  isClosed?: boolean;
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
  deskripsi?: string;
  petugasUkur?: { nama: string; nip: string };
  puLapang?: { nama: string; nip: string };
  petugasPemetaan?: { nama: string; nip: string };
  petugasKKS?: { nama: string; nip: string };
  createdBy?: { firstName: string; lastName: string };
  createdAt: string;
  history?: Array<{
    id: string;
    oldStatus?: string;
    newStatus?: string;
    reason?: string;
    changedAt: string;
  }>;
}

export default function BerkasDetailPage() {
  const params = useParams();
  const berkasId = params.id as string;
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.roles?.some((r) => r.name === 'administrator') ?? false;

  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: berkas, isLoading, error } = useBerkasDetail(berkasId);
  const { invalidateBerkas } = useCacheInvalidation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  if (isLoading) {
    return <SectionLoader label="Memuat data berkas..." />;
  }

  if (error || !berkas) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">
            {(error as Error)?.message || 'Berkas tidak ditemukan'}
          </p>
        </div>
        <Link href="/berkas/all">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
    );
  }

  const statusCfg = getStatusConfig(berkas.status);
  const currentStage = statusCfg.stage;
  const isClosed = berkas.status === 'DITUTUP' || berkas.isClosed;
  const isDone = berkas.status === 'SELESAI';

  const hasAttachments = !!(berkas.di302 || berkas.di305 || berkas.kks);
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
  const historyCount = berkas.history?.length ?? 0;

  return (
    <div className="space-y-5">
      {isAdmin && (
        <EditBerkasModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            invalidateBerkas();
          }}
          berkas={berkas}
        />
      )}

      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/berkas/all">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kembali
            </Button>
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">
              Manajemen Berkas
            </p>
            <h1 className="text-lg font-bold text-gray-900 truncate">Detail Berkas</h1>
          </div>
        </div>
        {isAdmin && !isClosed && (
          <Button onClick={() => setEditModalOpen(true)} className="flex-shrink-0">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Berkas
          </Button>
        )}
      </div>

      {/* ─── Document Identity Card ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Semantic accent strip */}
        <div
          className={`h-1 w-full ${isClosed ? 'bg-red-500' : isDone ? 'bg-green-500' : statusCfg.category === 'revision' ? 'bg-orange-400' : 'bg-blue-500'}`}
        />

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <div className="flex-1 min-w-0">
              {/* Status badge */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusCfg.badge}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dotColor}`}
                  />
                  {statusCfg.label}
                </span>
                {berkas.isClosed && berkas.status !== 'DITUTUP' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    Ditutup
                  </span>
                )}
              </div>
              {/* Document number */}
              <h2 className="text-2xl font-bold text-gray-900 font-mono leading-tight">
                {berkas.nomor}
              </h2>
              {/* Key metadata */}
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
                {berkas.namaPemohon && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium text-gray-700">{berkas.namaPemohon}</span>
                  </span>
                )}
                {(berkas.desa || berkas.kecamatan) && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {[berkas.desa, berkas.kecamatan].filter(Boolean).join(', ')}
                  </span>
                )}
                {berkas.tanggalBerkas && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(berkas.tanggalBerkas)}
                  </span>
                )}
                {berkas.kegiatan && <span>{berkas.kegiatan}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Workflow Progress Tracker ────────────────────────────────────────── */}
        {!isClosed ? (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">ALUR PROSES</p>
            <div className="overflow-x-auto -mx-1">
              <ol className="flex items-start min-w-[720px] px-1">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const isCompleted = currentStage > idx;
                  const isCurrent = currentStage === idx;
                  const isFirst = idx === 0;
                  const isLast = idx === WORKFLOW_STAGES.length - 1;

                  return (
                    <li key={stage.key} className="flex-1 min-w-0 flex flex-col items-center">
                      <div className="flex w-full items-center">
                        <div
                          className={`flex-1 h-0.5 ${isFirst ? 'invisible' : currentStage >= idx ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                        <div
                          className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${isCompleted ? 'bg-blue-600 text-white' : isCurrent ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-sm' : 'bg-white border-2 border-gray-200 text-gray-300'}`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <div
                          className={`flex-1 h-0.5 ${isLast ? 'invisible' : currentStage > idx ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] font-medium text-center ${isCurrent ? 'text-blue-600 font-semibold' : isCompleted ? 'text-gray-500' : 'text-gray-300'}`}
                      >
                        {stage.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ) : (
          <div className="border-t border-red-100 bg-red-50 px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium">Berkas ini telah ditutup</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Main Content Tabs ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex px-4" aria-label="Tabs">
            {(
              [
                { key: 'detail', label: 'Detail Berkas' },
                { key: 'history', label: 'Riwayat', count: historyCount },
                { key: 'catatan', label: 'Catatan' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.label}
                {'count' in tab && tab.count > 0 && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ──── Detail Tab ──── */}
          {activeTab === 'detail' && (
            <div className="space-y-8">
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
                      berkas.luasPendaftaran
                        ? `${berkas.luasPendaftaran.toLocaleString('id-ID')} m²`
                        : null
                    }
                  />
                </dl>
              </section>

              {hasSurveyData && (
                <section>
                  <SectionHeading>Data Pengukuran</SectionHeading>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                    <StaffField
                      label="Petugas Ukur"
                      name={berkas.petugasUkur?.nama}
                      nip={berkas.petugasUkur?.nip}
                    />
                    <StaffField
                      label="PU Lapang"
                      name={berkas.puLapang?.nama}
                      nip={berkas.puLapang?.nip}
                    />
                    <DataField label="No. STP" value={berkas.noSTP} mono />
                    <DataField label="Tanggal STP" value={formatDate(berkas.tglSTP)} />
                    <DataField label="No. SHAT/NIBEL" value={berkas.noSHATNIBEL} mono />
                  </dl>
                </section>
              )}

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
                          <p className="text-xs font-semibold text-gray-500 mb-3">
                            Bidang {idx + 1}
                          </p>
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

              <section className="pt-2 border-t border-gray-100">
                <dl className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-400">Dibuat oleh</dt>
                    <dd className="mt-0.5 text-sm text-gray-600">
                      {berkas.createdBy
                        ? `${berkas.createdBy.firstName} ${berkas.createdBy.lastName}`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-400">Tanggal dibuat</dt>
                    <dd className="mt-0.5 text-sm text-gray-600">{formatDate(berkas.createdAt)}</dd>
                  </div>
                </dl>
              </section>
            </div>
          )}

          {/* ──── Riwayat Tab ──── */}
          {activeTab === 'history' && <HistoryTimeline history={berkas.history} />}

          {/* ──── Catatan Tab ──── */}
          {activeTab === 'catatan' && (
            <BerkasCatatanTab berkasId={berkasId} initialDeskripsi={berkas.deskripsi} />
          )}
        </div>
      </div>
    </div>
  );
}
