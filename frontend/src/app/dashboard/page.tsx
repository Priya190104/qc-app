'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Alert, PageHeader, Modal, ModalHeader, ModalBody, LoadingSpinner } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useDashboardMetrics, useDashboardPetugasStats } from '@/hooks/useQueryHooks';
import { toast } from '@/stores/toastStore';
import {
  FileStack,
  Timer,
  CheckCircle2,
  Lock,
  Ruler,
  Map,
  AlertTriangle,
  ChevronRight,
  Inbox,
} from 'lucide-react';

interface DashboardMetrics {
  summary: {
    totalBerkas: number;
    inProcessBerkas: number;
    completedBerkas: number;
    ditutup: number;
  };
  statusDistribution: {
    dibuat: number;
    diOperatorDataUkur: number;
    diPetugasUkur: number;
    diOperatorDataPemetaan: number;
    diPetugasPemetaan: number;
    pemilihanKKS: number;
    diKKS: number;
    revisiKKS: number;
    diKepalaSeksi: number;
    revisiKasi: number;
    selesai: number;
    ditutup: number;
  };
}

interface PetugasStat {
  id: string;
  nama: string;
  nip: string;
  departemen: string;
  jumlahProses: number;
  jumlahRevisi: number;
}

interface PetugasStats {
  petugasUkur: PetugasStat[];
  petugasPemetaan: PetugasStat[];
}

interface BerkasSummaryItem {
  no: number;
  id: string;
  nomor: string;
  namaPemohon: string;
  kegiatan: string;
  jenis: string;
}

// â”€â”€ Skeleton Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-4 w-28 bg-gray-200 rounded-md" />
        <div className="h-9 w-9 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded-md mb-1" />
      <div className="h-3 w-36 bg-gray-100 rounded-md mb-4" />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-gray-100 rounded-md" />
          <div className="h-4 w-10 bg-gray-200 rounded-md" />
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

function StatusPanelSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-5 w-52 bg-gray-200 rounded-md mb-2" />
      <div className="h-3 w-72 bg-gray-100 rounded-md mb-5" />
      <div className="h-6 w-full bg-gray-200 rounded-lg mb-6" />
      <div className="space-y-3">
        {[40, 90, 70, 55, 80, 60, 45, 75, 65, 50, 85, 35].map((w, i) => (
          <div key={i} className="flex items-center gap-3 h-5">
            <div className="h-3.5 bg-gray-200 rounded-md shrink-0" style={{ width: 128 }} />
            <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
              <div className="h-full bg-gray-200 rounded-sm" style={{ width: `${w}%` }} />
            </div>
            <div className="h-3.5 w-7 bg-gray-200 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PetugasSectionSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="h-4 w-36 bg-gray-200 rounded-md" />
      </div>
      <div className="p-4 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
            <div className="h-9 w-9 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 bg-gray-200 rounded-md" />
              <div className="h-3 w-20 bg-gray-100 rounded-md" />
              <div className="h-2 w-full bg-gray-100 rounded-full" />
            </div>
            <div className="h-4 w-4 bg-gray-200 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat dashboard">
      <div className="animate-pulse space-y-2">
        <div className="h-7 w-36 bg-gray-200 rounded-md" />
        <div className="h-4 w-72 bg-gray-100 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <StatusPanelSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PetugasSectionSkeleton />
        <PetugasSectionSkeleton />
      </div>
    </div>
  );
}

// â”€â”€ KPI Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const KPI_CFG = {
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    num: 'text-gray-900',
    bar: 'bg-blue-500',
    badge: 'text-blue-700 bg-blue-50',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    num: 'text-amber-700',
    bar: 'bg-amber-500',
    badge: 'text-amber-700 bg-amber-50',
  },
  green: {
    icon: 'bg-green-50 text-green-600',
    num: 'text-green-700',
    bar: 'bg-green-500',
    badge: 'text-green-700 bg-green-50',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600',
    num: 'text-slate-700',
    bar: 'bg-slate-400',
    badge: 'text-slate-600 bg-slate-100',
  },
} as const;

type KpiColor = keyof typeof KPI_CFG;

function KpiCard({
  label,
  value,
  total,
  color,
  icon: Icon,
  description,
}: {
  label: string;
  value: number;
  total: number;
  color: KpiColor;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const c = KPI_CFG[color];
  const showBar = color !== 'blue' && total > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${c.icon}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums tracking-tight ${c.num}`}>
        {value.toLocaleString('id-ID')}
      </p>
      <p className="text-xs text-gray-400 mt-0.5 mb-3 leading-snug">{description}</p>
      {showBar ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">dari total berkas</span>
            <span
              className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${c.badge}`}
            >
              {pct}%
            </span>
          </div>
          <div
            className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% dari total berkas`}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${c.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="h-8" />
      )}
    </div>
  );
}

// â”€â”€ Status Distribution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_LIST = [
  { key: 'dibuat', label: 'Dibuat', bar: 'bg-slate-400', seg: '#94a3b8', group: 'Input' },
  {
    key: 'pemilihanKKS',
    label: 'Pemilihan KKS',
    bar: 'bg-blue-400',
    seg: '#60a5fa',
    group: 'Pengukuran',
  },
  { key: 'diKKS', label: 'Di KKS', bar: 'bg-blue-600', seg: '#2563eb', group: 'Pengukuran' },
  {
    key: 'diOperatorDataUkur',
    label: 'Op. Data Ukur',
    bar: 'bg-indigo-400',
    seg: '#818cf8',
    group: 'Pengukuran',
  },
  {
    key: 'diPetugasUkur',
    label: 'Petugas Ukur',
    bar: 'bg-indigo-600',
    seg: '#4f46e5',
    group: 'Pengukuran',
  },
  {
    key: 'diOperatorDataPemetaan',
    label: 'Op. Data Pemetaan',
    bar: 'bg-violet-500',
    seg: '#8b5cf6',
    group: 'Pemetaan',
  },
  {
    key: 'diPetugasPemetaan',
    label: 'Petugas Pemetaan',
    bar: 'bg-violet-700',
    seg: '#6d28d9',
    group: 'Pemetaan',
  },
  {
    key: 'diKepalaSeksi',
    label: 'Kepala Seksi',
    bar: 'bg-purple-600',
    seg: '#9333ea',
    group: 'Review',
  },
  { key: 'revisiKKS', label: 'Revisi KKS', bar: 'bg-amber-500', seg: '#f59e0b', group: 'Revisi' },
  {
    key: 'revisiKasi',
    label: 'Revisi Kasi',
    bar: 'bg-orange-500',
    seg: '#f97316',
    group: 'Revisi',
  },
  { key: 'selesai', label: 'Selesai', bar: 'bg-green-500', seg: '#22c55e', group: 'Final' },
  { key: 'ditutup', label: 'Ditutup', bar: 'bg-gray-400', seg: '#9ca3af', group: 'Final' },
] as const;

function StatusDistributionPanel({
  distribution,
}: {
  distribution: DashboardMetrics['statusDistribution'];
}) {
  const rows = useMemo(
    () =>
      STATUS_LIST.map((s) => ({
        ...s,
        value: (distribution as Record<string, number>)[s.key] ?? 0,
      })),
    [distribution]
  );
  const grandTotal = useMemo(() => rows.reduce((sum, r) => sum + r.value, 0), [rows]);
  const maxValue = useMemo(() => Math.max(...rows.map((r) => r.value), 1), [rows]);

  const groups = useMemo(() => {
    const g: Record<string, typeof rows> = {};
    rows.forEach((r) => {
      if (!g[r.group]) g[r.group] = [];
      g[r.group].push(r);
    });
    return Object.entries(g);
  }, [rows]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Distribusi Status Berkas</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {grandTotal.toLocaleString('id-ID')} berkas terdistribusi di seluruh tahap alur kerja
        </p>
      </div>

      {/* Stacked overview bar */}
      {grandTotal > 0 && (
        <div className="px-6 pt-4 pb-3">
          <div
            className="flex h-6 w-full rounded-md overflow-hidden gap-px"
            role="img"
            aria-label="Diagram proporsi status berkas"
          >
            {rows
              .filter((r) => r.value > 0)
              .map((r) => (
                <div
                  key={r.key}
                  title={`${r.label}: ${r.value}`}
                  className="h-full"
                  style={{
                    width: `${(r.value / grandTotal) * 100}%`,
                    backgroundColor: r.seg,
                    minWidth: 2,
                  }}
                />
              ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Lebar segmen = proporsi berkas per status
          </p>
        </div>
      )}

      {/* Per-status rows grouped by phase */}
      <div className="px-6 pb-5 pt-1 space-y-0">
        {groups.map(([groupName, groupRows]) => (
          <div key={groupName} className="mb-4 last:mb-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 pt-1">
              {groupName}
            </p>
            <div className="space-y-1.5">
              {groupRows.map((r) => {
                const barPct = (r.value / maxValue) * 100;
                const isRevisi = r.group === 'Revisi';
                return (
                  <div key={r.key} className="flex items-center gap-3 h-5">
                    <span
                      className={`text-xs shrink-0 text-right leading-tight ${isRevisi ? 'text-amber-700 font-medium' : 'text-gray-600'}`}
                      style={{ width: 128 }}
                    >
                      {isRevisi && (
                        <AlertTriangle
                          className="inline w-3 h-3 mr-1 text-amber-400 -mt-px"
                          aria-hidden="true"
                        />
                      )}
                      {r.label}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
                      {r.value > 0 && (
                        <div
                          className={`h-full ${r.bar} rounded-sm flex items-center justify-end transition-all duration-500 ease-out`}
                          style={{ width: `${Math.max(barPct, 2)}%` }}
                        >
                          {barPct > 12 && (
                            <span className="text-white text-[10px] font-bold pr-1.5 tabular-nums">
                              {r.value}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums shrink-0 w-7 text-right ${
                        r.value === 0
                          ? 'text-gray-300'
                          : isRevisi
                            ? 'text-amber-700'
                            : 'text-gray-700'
                      }`}
                    >
                      {r.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€ Petugas Workload Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PetugasCard({
  petugas,
  maxTotal,
  accentClass,
  onClick,
}: {
  petugas: PetugasStat;
  maxTotal: number;
  accentClass: string;
  onClick: () => void;
}) {
  const total = petugas.jumlahProses + petugas.jumlahRevisi;
  const prosePct = total > 0 ? (petugas.jumlahProses / total) * 100 : 0;
  const loadPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const hasRevisi = petugas.jumlahRevisi > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 group"
    >
      <div
        className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${accentClass}`}
        aria-label={`Total ${total} berkas`}
      >
        {total}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{petugas.nama}</p>
        <p className="text-[11px] text-gray-400 mb-1.5">{petugas.nip}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-100 rounded-full overflow-hidden"
              style={{ width: `${loadPct}%` }}
            >
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prosePct}%` }} />
            </div>
          </div>
          <span className="text-[10px] text-gray-400 tabular-nums shrink-0 w-16 text-right">
            {petugas.jumlahProses}p{' '}
            {hasRevisi && (
              <span className="text-amber-600 font-semibold">{petugas.jumlahRevisi}r</span>
            )}
          </span>
        </div>
      </div>
      <ChevronRight
        className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
        aria-hidden="true"
      />
    </button>
  );
}

function PetugasSection({
  title,
  icon: Icon,
  data,
  accentClass,
  tipe,
  onCardClick,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: PetugasStat[];
  accentClass: string;
  tipe: 'ukur' | 'pemetaan';
  onCardClick: (petugas: PetugasStat, tipe: 'ukur' | 'pemetaan') => void;
}) {
  const maxTotal = useMemo(
    () => Math.max(...data.map((p) => p.jumlahProses + p.jumlahRevisi), 1),
    [data]
  );
  const totalRevisi = data.reduce((s, p) => s + p.jumlahRevisi, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {data.length > 0 && (
            <span className="text-xs text-gray-400 font-normal">({data.length} petugas)</span>
          )}
        </div>
        {totalRevisi > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            {totalRevisi} revisi
          </span>
        )}
      </div>
      <div className="p-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-gray-500">Tidak ada {title.toLowerCase()}</p>
            <p className="text-xs text-gray-400 mt-1">Data muncul saat ada penugasan aktif</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((p) => (
              <PetugasCard
                key={p.id}
                petugas={p}
                maxTotal={maxTotal}
                accentClass={accentClass}
                onClick={() => onCardClick(p, tipe)}
              />
            ))}
          </div>
        )}
      </div>
      {data.length > 0 && (
        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
            Proses
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
            Revisi
          </span>
          <span className="ml-auto text-gray-400">Klik kartu untuk detail berkas</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: petugasStats, isLoading: petugasLoading } = useDashboardPetugasStats();

  const loading = metricsLoading || petugasLoading;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPetugas, setModalPetugas] = useState<{
    nama: string;
    nip: string;
    tipe: 'ukur' | 'pemetaan';
  } | null>(null);
  const [modalBerkas, setModalBerkas] = useState<BerkasSummaryItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handlePetugasClick = useCallback(
    async (petugas: PetugasStat, tipe: 'ukur' | 'pemetaan') => {
      setModalPetugas({ nama: petugas.nama, nip: petugas.nip, tipe });
      setModalBerkas([]);
      setModalOpen(true);
      setModalLoading(true);
      try {
        const res = await apiClient.get<{ data?: { data?: BerkasSummaryItem[]; total?: number } }>(
          `/dashboard/petugas-berkas?petugasId=${petugas.id}&tipe=${tipe}`
        );
        setModalBerkas(res.data?.data?.data || []);
      } catch {
        setModalBerkas([]);
        toast.error('Gagal memuat data', 'Tidak dapat mengambil daftar berkas petugas.');
      } finally {
        setModalLoading(false);
      }
    },
    []
  );

  if (loading) return <DashboardSkeleton />;

  const total = metrics?.summary?.totalBerkas ?? 0;

  return (
    <div className="space-y-6">
      {/* Detail berkas per petugas */}
      <Modal
        isOpen={modalOpen && !!modalPetugas}
        onClose={closeModal}
        titleId="modal-petugas-title"
        maxWidth="3xl"
      >
        <ModalHeader
          id="modal-petugas-title"
          title={`Berkas Aktif - ${modalPetugas?.nama}`}
          subtitle={`NIP: ${modalPetugas?.nip}`}
          onClose={closeModal}
        />
        <ModalBody scrollable>
          {modalLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="md" label="Memuat data berkas..." />
            </div>
          ) : modalBerkas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-600">Tidak ada berkas aktif</p>
              <p className="text-xs text-gray-400 mt-1">
                Petugas ini belum memiliki berkas yang sedang diproses
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th scope="col" className="pb-3 pr-3 text-xs font-semibold text-gray-500 w-8">
                    No
                  </th>
                  <th scope="col" className="pb-3 pr-3 text-xs font-semibold text-gray-500">
                    No. Berkas
                  </th>
                  <th scope="col" className="pb-3 pr-3 text-xs font-semibold text-gray-500">
                    Nama Pemohon
                  </th>
                  <th scope="col" className="pb-3 pr-3 text-xs font-semibold text-gray-500">
                    Kegiatan
                  </th>
                  <th scope="col" className="pb-3 text-xs font-semibold text-gray-500">
                    Jenis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {modalBerkas.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-3 text-xs text-gray-400 tabular-nums">{b.no}</td>
                    <td className="py-2.5 pr-3 text-xs font-medium text-gray-900">{b.nomor}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700">{b.namaPemohon}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-600">{b.kegiatan}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          b.jenis === 'Revisi'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {b.jenis}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ModalBody>
        {!modalLoading && modalBerkas.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <span>Total berkas aktif</span>
            <span className="font-semibold text-gray-800 tabular-nums">{modalBerkas.length}</span>
          </div>
        )}
      </Modal>

      <PageHeader title="Dashboard" description="Monitoring status dan performa sistem QC berkas" />

      {metricsError && (
        <Alert
          type="error"
          title="Gagal memuat dashboard"
          message={(metricsError as Error)?.message ?? 'Terjadi kesalahan saat mengambil data.'}
          className="mb-2"
        />
      )}

      {/* â”€â”€ KPI Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Berkas"
              value={total}
              total={total}
              color="blue"
              icon={FileStack}
              description="Keseluruhan berkas dalam sistem"
            />
            <KpiCard
              label="Dalam Proses"
              value={metrics.summary?.inProcessBerkas ?? 0}
              total={total}
              color="amber"
              icon={Timer}
              description="Sedang diproses oleh tim"
            />
            <KpiCard
              label="Selesai"
              value={metrics.summary?.completedBerkas ?? 0}
              total={total}
              color="green"
              icon={CheckCircle2}
              description="Berkas selesai diproses"
            />
            <KpiCard
              label="Ditutup"
              value={metrics.summary?.ditutup ?? 0}
              total={total}
              color="slate"
              icon={Lock}
              description="Berkas telah ditutup"
            />
          </div>

          {/* â”€â”€ Status Distribution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <StatusDistributionPanel distribution={metrics.statusDistribution} />
        </>
      )}

      {/* â”€â”€ Petugas Monitoring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {petugasStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PetugasSection
            title="Petugas Ukur"
            icon={Ruler}
            data={petugasStats.petugasUkur ?? []}
            accentClass="bg-indigo-600"
            tipe="ukur"
            onCardClick={handlePetugasClick}
          />
          <PetugasSection
            title="Petugas Pemetaan"
            icon={Map}
            data={petugasStats.petugasPemetaan ?? []}
            accentClass="bg-teal-600"
            tipe="pemetaan"
            onCardClick={handlePetugasClick}
          />
        </div>
      )}
    </div>
  );
}
