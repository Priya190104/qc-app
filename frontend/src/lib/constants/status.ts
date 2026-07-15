/**
 * Single Source of Truth untuk konfigurasi status workflow berkas.
 * Satu definisi untuk seluruh aplikasi — StatusBadge, BerkasTable, detail page.
 */

export interface StatusConfig {
  /** Label yang ditampilkan ke pengguna */
  label: string;
  /** Kelas teks untuk StatusBadge (rounded-full border style) */
  color: string;
  /** Kelas bg + border untuk StatusBadge (rounded-full border style) */
  bg: string;
  /** Full className untuk inline badge / ring-1 style */
  badge: string;
  /** Warna dot indikator */
  dotColor: string;
  /** Urutan stage dalam workflow (0 = awal, 8 = selesai, -1 = terminal non-selesai) */
  stage: number;
  /** Kategori status */
  category: 'start' | 'active' | 'revision' | 'terminal';
}

export const BERKAS_STATUS_CONFIG: Record<string, StatusConfig> = {
  DIBUAT: {
    label: 'Dibuat',
    color: 'text-slate-700',
    bg: 'bg-slate-100 border-slate-300',
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
    dotColor: 'bg-slate-400',
    stage: 0,
    category: 'start',
  },
  DI_OPERATOR_DATA_UKUR: {
    label: 'Op. Data Ukur',
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
    badge: 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-300',
    dotColor: 'bg-sky-500',
    stage: 1,
    category: 'active',
  },
  DI_PETUGAS_UKUR: {
    label: 'Petugas Ukur',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
    dotColor: 'bg-blue-500',
    stage: 2,
    category: 'active',
  },
  DI_OPERATOR_DATA_PEMETAAN: {
    label: 'Op. Data Pemetaan',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700 ring-1 ring-inset ring-cyan-300',
    dotColor: 'bg-cyan-500',
    stage: 3,
    category: 'active',
  },
  DI_PETUGAS_PEMETAAN: {
    label: 'Petugas Pemetaan',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-300',
    dotColor: 'bg-teal-500',
    stage: 4,
    category: 'active',
  },
  PEMILIHAN_KKS: {
    label: 'Pemilihan KKS',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300',
    dotColor: 'bg-amber-400',
    stage: 5,
    category: 'active',
  },
  DI_KKS: {
    label: 'Di KKS',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    badge: 'bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-300',
    dotColor: 'bg-violet-500',
    stage: 6,
    category: 'active',
  },
  REVISI_KKS: {
    label: 'Revisi KKS',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
    dotColor: 'bg-orange-500',
    stage: 6,
    category: 'revision',
  },
  DI_KEPALA_SEKSI: {
    label: 'Kepala Seksi',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-300',
    dotColor: 'bg-purple-500',
    stage: 7,
    category: 'active',
  },
  REVISI_KASI: {
    label: 'Revisi Kasi',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
    dotColor: 'bg-red-400',
    stage: 7,
    category: 'revision',
  },
  SELESAI: {
    label: 'Selesai',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300',
    dotColor: 'bg-green-500',
    stage: 8,
    category: 'terminal',
  },
  DITUTUP: {
    label: 'Ditutup',
    color: 'text-red-800',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-300',
    dotColor: 'bg-red-600',
    stage: -1,
    category: 'terminal',
  },
  // Legacy / alternatif statuses (dari BerkasTable)
  PROSES: {
    label: 'Proses',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300',
    dotColor: 'bg-blue-500',
    stage: 1,
    category: 'active',
  },
  DIUKUR: {
    label: 'Diukur',
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
    badge: 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-300',
    dotColor: 'bg-sky-500',
    stage: 2,
    category: 'active',
  },
  DIPETAKAN: {
    label: 'Dipetakan',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-300',
    dotColor: 'bg-teal-500',
    stage: 4,
    category: 'active',
  },
  DIPERIKSA: {
    label: 'Diperiksa',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-300',
    dotColor: 'bg-indigo-500',
    stage: 7,
    category: 'active',
  },
  REVISI: {
    label: 'Revisi',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-300',
    dotColor: 'bg-orange-500',
    stage: 6,
    category: 'revision',
  },
  DITOLAK: {
    label: 'Ditolak',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
    dotColor: 'bg-red-400',
    stage: -1,
    category: 'terminal',
  },
};

/** Fallback config untuk status yang tidak dikenal */
export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  label: '',
  color: 'text-gray-700',
  bg: 'bg-gray-100 border-gray-200',
  badge: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200',
  dotColor: 'bg-gray-400',
  stage: 0,
  category: 'active',
};

/** Helper: ambil config status, fallback ke default jika tidak ditemukan */
export function getStatusConfig(status: string): StatusConfig {
  const cfg = BERKAS_STATUS_CONFIG[status];
  if (!cfg) {
    return {
      ...DEFAULT_STATUS_CONFIG,
      label: status.replace(/_/g, ' '),
    };
  }
  return cfg;
}

/** Urutan stage workflow untuk komponen progress bar */
export const WORKFLOW_STAGES = [
  { key: 'DIBUAT', label: 'Dibuat' },
  { key: 'DI_OPERATOR_DATA_UKUR', label: 'Op. Ukur' },
  { key: 'DI_PETUGAS_UKUR', label: 'Ptgs. Ukur' },
  { key: 'DI_OPERATOR_DATA_PEMETAAN', label: 'Op. Pemetaan' },
  { key: 'DI_PETUGAS_PEMETAAN', label: 'Ptgs. Pemetaan' },
  { key: 'PEMILIHAN_KKS', label: 'Pemilihan KKS' },
  { key: 'DI_KKS', label: 'KKS' },
  { key: 'DI_KEPALA_SEKSI', label: 'Kepala Seksi' },
  { key: 'SELESAI', label: 'Selesai' },
] as const;
