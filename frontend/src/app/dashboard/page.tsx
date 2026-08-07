'use client';

import React, { useState, useCallback } from 'react';
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
  Eye,
  RotateCcw,
  FileText,
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
    <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="h-11 w-11 bg-gray-200 rounded-xl" />
        <div className="h-7 w-12 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-10 w-20 bg-gray-200 rounded-md mb-1.5" />
      <div className="h-4 w-24 bg-gray-200 rounded-md mb-1" />
      <div className="h-3.5 w-40 bg-gray-100 rounded-md mb-5" />
      <div className="h-2 bg-gray-100 rounded-full" />
    </div>
  );
}

function StatusPanelSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-40 bg-gray-200 rounded-md" />
          <div className="h-4 w-64 bg-gray-100 rounded-md" />
        </div>
        <div className="space-y-1 text-right">
          <div className="h-8 w-12 bg-gray-200 rounded-md" />
          <div className="h-3 w-16 bg-gray-100 rounded-md" />
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
              <div className="h-7 w-7 bg-gray-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
                <div className="h-3 w-32 bg-gray-100 rounded-md" />
              </div>
              <div className="h-6 w-8 bg-gray-200 rounded-md shrink-0" />
            </div>
            <div className="px-4 py-3 space-y-2">
              {[0, 1].map((j) => (
                <div key={j} className="flex items-center justify-between gap-2">
                  <div className="h-3 bg-gray-100 rounded-md flex-1" />
                  <div className="h-3.5 w-6 bg-gray-200 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PetugasSectionSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className="h-7 w-7 bg-gray-200 rounded-lg shrink-0" />
        <div className="space-y-1">
          <div className="h-4 w-36 bg-gray-200 rounded-md" />
          <div className="h-3 w-20 bg-gray-100 rounded-md" />
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-lg">
            <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 bg-gray-200 rounded-md" />
              <div className="h-3 w-20 bg-gray-100 rounded-md" />
              <div className="flex gap-3">
                <div className="h-3 w-16 bg-gray-100 rounded-md" />
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
              </div>
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
    <div className="space-y-8" aria-busy="true" aria-label="Memuat dashboard">
      <div className="animate-pulse space-y-2">
        <div className="h-7 w-36 bg-gray-200 rounded-md" />
        <div className="h-4 w-72 bg-gray-100 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    container: 'border-blue-200 bg-blue-50/50',
    icon: 'bg-blue-100 text-blue-700',
    num: 'text-blue-900',
    bar: 'bg-blue-500',
    barTrack: 'bg-blue-100',
    badge: 'text-blue-700 bg-blue-100',
  },
  amber: {
    container: 'border-amber-200 bg-amber-50/50',
    icon: 'bg-amber-100 text-amber-700',
    num: 'text-amber-900',
    bar: 'bg-amber-500',
    barTrack: 'bg-amber-100',
    badge: 'text-amber-700 bg-amber-100',
  },
  green: {
    container: 'border-green-200 bg-green-50/50',
    icon: 'bg-green-100 text-green-700',
    num: 'text-green-900',
    bar: 'bg-green-500',
    barTrack: 'bg-green-100',
    badge: 'text-green-700 bg-green-100',
  },
  slate: {
    container: 'border-slate-200 bg-slate-50/50',
    icon: 'bg-slate-100 text-slate-600',
    num: 'text-slate-800',
    bar: 'bg-slate-400',
    barTrack: 'bg-slate-100',
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
  const showPct = color !== 'blue' && total > 0;

  return (
    <div
      className={`rounded-xl border ${c.container} p-6 transition-shadow duration-200 hover:shadow-sm`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`p-3 rounded-xl ${c.icon}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        {showPct && (
          <span className={`text-sm font-semibold tabular-nums px-2 py-1 rounded-lg ${c.badge}`}>
            {pct}%
          </span>
        )}
      </div>
      <p className={`text-4xl font-bold tabular-nums tracking-tight ${c.num}`}>
        {value.toLocaleString('id-ID')}
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">{label}</p>
      <p className="text-sm text-gray-500 mt-0.5 mb-4 leading-snug">{description}</p>
      {showPct && (
        <div
          className={`h-2.5 ${c.barTrack} rounded-full overflow-hidden`}
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
      )}
    </div>
  );
}

// â”€â”€ Status Distribution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_LABELS: Record<string, string> = {
  dibuat: 'Dibuat',
  pemilihanKKS: 'Pemilihan KKS',
  diKKS: 'Di KKS',
  diOperatorDataUkur: 'Operator Data Ukur',
  diPetugasUkur: 'Petugas Ukur',
  diOperatorDataPemetaan: 'Operator Data Pemetaan',
  diPetugasPemetaan: 'Petugas Pemetaan',
  diKepalaSeksi: 'Kepala Seksi',
  revisiKKS: 'Revisi KKS',
  revisiKasi: 'Revisi Kepala Seksi',
  selesai: 'Selesai',
  ditutup: 'Ditutup',
};

const PHASES = [
  {
    key: 'input',
    label: 'Tahap Input',
    desc: 'Berkas baru masuk sistem',
    icon: FileText,
    headerBg: 'bg-slate-50',
    headerBorder: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    countColor: 'text-slate-700',
    statuses: ['dibuat'],
    isAlert: false,
  },
  {
    key: 'pengukuran',
    label: 'Tahap Pengukuran',
    desc: 'Pengukuran dan pengolahan data',
    icon: Ruler,
    headerBg: 'bg-blue-50',
    headerBorder: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    countColor: 'text-blue-800',
    statuses: ['pemilihanKKS', 'diKKS', 'diOperatorDataUkur', 'diPetugasUkur'],
    isAlert: false,
  },
  {
    key: 'pemetaan',
    label: 'Tahap Pemetaan',
    desc: 'Penggambaran dan pengolahan peta',
    icon: Map,
    headerBg: 'bg-indigo-50',
    headerBorder: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-700',
    countColor: 'text-indigo-800',
    statuses: ['diOperatorDataPemetaan', 'diPetugasPemetaan'],
    isAlert: false,
  },
  {
    key: 'review',
    label: 'Tahap Review',
    desc: 'Pemeriksaan oleh kepala seksi',
    icon: Eye,
    headerBg: 'bg-purple-50',
    headerBorder: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    countColor: 'text-purple-800',
    statuses: ['diKepalaSeksi'],
    isAlert: false,
  },
  {
    key: 'revisi',
    label: 'Perlu Revisi',
    desc: 'Berkas dikembalikan untuk perbaikan',
    icon: RotateCcw,
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-300',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    countColor: 'text-amber-800',
    statuses: ['revisiKKS', 'revisiKasi'],
    isAlert: true,
  },
  {
    key: 'final',
    label: 'Selesai & Ditutup',
    desc: 'Berkas telah selesai diproses',
    icon: CheckCircle2,
    headerBg: 'bg-green-50',
    headerBorder: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    countColor: 'text-green-800',
    statuses: ['selesai', 'ditutup'],
    isAlert: false,
  },
];

function StatusDistributionPanel({
  distribution,
}: {
  distribution: DashboardMetrics['statusDistribution'];
}) {
  const dist = distribution as Record<string, number>;
  const grandTotal = Object.values(dist).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Alur Proses Berkas</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Total {grandTotal.toLocaleString('id-ID')} berkas terbagi dalam tahapan alur kerja
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold tabular-nums text-gray-900">
            {grandTotal.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 leading-tight">total berkas</p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PHASES.map((phase) => {
          const PhaseIcon = phase.icon;
          const phaseTotal = phase.statuses.reduce((s, k) => s + (dist[k] ?? 0), 0);
          return (
            <div
              key={phase.key}
              className={`rounded-lg border ${phase.headerBorder} overflow-hidden`}
            >
              <div className={`${phase.headerBg} px-4 py-3 flex items-center gap-3`}>
                <div className={`${phase.iconBg} p-1.5 rounded-lg shrink-0`}>
                  <PhaseIcon className={`w-4 h-4 ${phase.iconColor}`} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${phase.countColor} leading-tight`}>
                    {phase.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{phase.desc}</p>
                </div>
                <span className={`text-xl font-bold tabular-nums ${phase.countColor} shrink-0`}>
                  {phaseTotal}
                </span>
              </div>

              <div className="px-4 py-3 bg-white space-y-2">
                {phase.isAlert && phaseTotal > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="font-medium">Memerlukan perhatian segera</span>
                  </div>
                )}
                {phase.statuses.map((statusKey) => {
                  const count = dist[statusKey] ?? 0;
                  return (
                    <div key={statusKey} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-600 leading-tight">
                        {STATUS_LABELS[statusKey]}
                      </span>
                      <span
                        className={`text-sm font-semibold tabular-nums shrink-0 ${
                          count === 0 ? 'text-gray-300' : 'text-gray-800'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
                {phaseTotal === 0 && (
                  <p className="text-xs text-gray-400 italic py-0.5">Tidak ada berkas</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// â”€â”€ Petugas Workload Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PetugasCard({
  petugas,
  accentClass,
  onClick,
}: {
  petugas: PetugasStat;
  accentClass: string;
  onClick: () => void;
}) {
  const total = petugas.jumlahProses + petugas.jumlahRevisi;
  const hasRevisi = petugas.jumlahRevisi > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 group"
    >
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${accentClass}`}
        aria-label={`Total ${total} berkas`}
      >
        {total}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{petugas.nama}</p>
        <p className="text-xs text-gray-500 mb-2">{petugas.nip}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-600">
            <span className="font-semibold text-gray-800">{petugas.jumlahProses}</span> Proses
          </span>
          {hasRevisi && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              {petugas.jumlahRevisi} Revisi
            </span>
          )}
        </div>
      </div>
      <ChevronRight
        className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors"
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
  const totalRevisi = data.reduce((s, p) => s + p.jumlahRevisi, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gray-100 rounded-lg shrink-0">
            <Icon className="w-4 h-4 text-gray-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {data.length > 0 && (
              <p className="text-xs text-gray-500">{data.length} petugas terdaftar</p>
            )}
          </div>
        </div>
        {totalRevisi > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            {totalRevisi} berkas perlu revisi
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
                accentClass={accentClass}
                onClick={() => onCardClick(p, tipe)}
              />
            ))}
          </div>
        )}
      </div>
      {data.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
              Berkas proses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              Perlu revisi
            </span>
          </div>
          <span className="text-gray-400">Klik untuk lihat detail berkas</span>
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
    <div className="space-y-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              description="Berkas yang masih dalam tahap proses"
            />
            <KpiCard
              label="Sudah Selesai"
              value={metrics.summary?.completedBerkas ?? 0}
              total={total}
              color="green"
              icon={CheckCircle2}
              description="Berkas yang telah selesai diproses"
            />
            <KpiCard
              label="Ditutup"
              value={metrics.summary?.ditutup ?? 0}
              total={total}
              color="slate"
              icon={Lock}
              description="Berkas yang sudah ditutup"
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
