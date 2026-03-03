// Authentication & User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: UserRole[];
}

export interface UserRole {
  id: string;
  name: string;
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Petugas (Staff) Types
export interface Petugas {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  departemen: string;
  userId: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  berkasCount?: {
    total: number;
    processed: number;
    approved: number;
    rejected: number;
  };
}

export interface CreatePetugasRequest {
  nama: string;
  nip: string;
  jabatan: string;
  departemen: string;
  userId: string;
  email: string;
}

export interface UpdatePetugasRequest {
  nama?: string;
  jabatan?: string;
  departemen?: string;
  email?: string;
}

// Dashboard Types
export interface DashboardMetrics {
  summary?: {
    totalBerkas: number;
    inProcessBerkas: number;
    completedBerkas: number;
    // Legacy fields for backward compatibility
    pendingBerkas?: number;
    inReviewBerkas?: number;
    approvedBerkas?: number;
    rejectedBerkas?: number;
    archivedBerkas?: number;
  };
  statusDistribution?: {
    pending?: { count: number; percentage: number };
    in_review?: { count: number; percentage: number };
    approved?: { count: number; percentage: number };
    rejected?: { count: number; percentage: number };
    archived?: { count: number; percentage: number };
  };
  topPetugas?: TopPetugas[];
}

export interface TopPetugas {
  id: string;
  nama: string;
  processed: number;
  approved: number;
  rejected: number;
}

export interface DashboardActivity {
  id: string;
  action: string;
  description: string;
  userId: string;
  user?: User;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'status_change' | 'assignment' | 'system_alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form State Types
export interface FormError {
  field: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
}

// Berkas Types
export enum BerkasStatus {
  DIBUAT = 'DIBUAT',
  DI_OPERATOR_DATA_UKUR = 'DI_OPERATOR_DATA_UKUR',
  DI_PETUGAS_UKUR = 'DI_PETUGAS_UKUR',
  DI_OPERATOR_DATA_PEMETAAN = 'DI_OPERATOR_DATA_PEMETAAN',
  DI_PETUGAS_PEMETAAN = 'DI_PETUGAS_PEMETAAN',
  PEMILIHAN_KKS = 'PEMILIHAN_KKS',
  DI_KKS = 'DI_KKS',
  DI_KEPALA_SEKSI = 'DI_KEPALA_SEKSI',
  SELESAI = 'SELESAI',
  DITUTUP = 'DITUTUP',
}

export const BerkasStatusLabels: Record<BerkasStatus, string> = {
  [BerkasStatus.DIBUAT]: 'Dibuat',
  [BerkasStatus.DI_OPERATOR_DATA_UKUR]: 'Di Operator Data Ukur',
  [BerkasStatus.DI_PETUGAS_UKUR]: 'Di Petugas Ukur',
  [BerkasStatus.DI_OPERATOR_DATA_PEMETAAN]: 'Di Operator Data Pemetaan',
  [BerkasStatus.DI_PETUGAS_PEMETAAN]: 'Di Petugas Pemetaan',
  [BerkasStatus.PEMILIHAN_KKS]: 'Pemilihan KKS',
  [BerkasStatus.DI_KKS]: 'Di KKS',
  [BerkasStatus.DI_KEPALA_SEKSI]: 'Di Kepala Seksi',
  [BerkasStatus.SELESAI]: 'Selesai',
  [BerkasStatus.DITUTUP]: 'Ditutup',
};

export interface Berkas {
  id: string;
  nomor: string;
  nama: string;
  status: BerkasStatus;
  deskripsi?: string;
  kegiatan?: string;
  tanggalBerkas?: string;
  tahunBerkas?: number;
  namaPemohon?: string;
  kecamatan?: string;
  desa?: string;
  namaProsedur?: string;
  luasPendaftaran?: string;
  di302?: string;
  di305?: string;
  kks?: string;
  // KKS Workflow fields
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
  // Workflow tracking
  kksId?: string;
  revisionCount: number;
  lastRevisionReason?: string;
  lastRevisionFrom?: string;
  // Relations
  createdBy?: User;
  createdById: string;
  approvedBy?: User;
  approvedById?: string;
  petugasUkur?: Petugas;
  puLapang?: Petugas;
  petugasPemetaan?: Petugas;
  kksUser?: User;
  history?: BerkasHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface BerkasHistory {
  id: string;
  berkasId: string;
  oldStatus?: string;
  newStatus?: string;
  changedById: string;
  reason?: string;
  changedAt: string;
  User?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateBerkasRequest {
  nomor: string;
  nama: string;
  kegiatan?: string;
  tanggalBerkas?: string;
  tahunBerkas?: number;
  namaPemohon?: string;
  kecamatan?: string;
  desa?: string;
  namaProsedur?: string;
  luasPendaftaran?: number;
  di302?: string;
  di305?: string;
  kks?: string;
  deskripsi?: string;
}

export interface UpdateBerkasRequest {
  kegiatan?: string;
  tanggalBerkas?: string;
  tahunBerkas?: number;
  namaPemohon?: string;
  kecamatan?: string;
  desa?: string;
  namaProsedur?: string;
  luasPendaftaran?: number;
  di302?: string;
  di305?: string;
  kks?: string;
  deskripsi?: string;
  status?: BerkasStatus;
  // KKS fields
  petugasUkurId?: string;
  puLapangId?: string;
  noSTP?: string;
  tglSTP?: string;
  noSHATNIBEL?: string;
  luasHasilUkur?: number;
  nib?: string;
  nibel?: string;
  jumlahBidang?: number;
  noSU?: string;
}

// Workflow DTOs
export interface UpdateDataUkurRequest {
  noSTP?: string;
  tglSTP?: string;
  kegiatan?: string;
  namaPemohon?: string;
  kecamatan?: string;
  desa?: string;
  namaProsedur?: string;
  luasPendaftaran?: number | string;
}

export interface ValidatePengukuranRequest {
  petugasUkurId: string;
  puLapangId?: string;
  noSHATNIBEL?: string;
  luasHasilUkur?: number;
  nib?: string;
  nibel?: string;
  jumlahBidang?: number;
  noSU?: string;
}

export interface UpdateDataPemetaanRequest {
  petugasPemetaanId?: string;
  luasHasilUkur?: number;
  nib?: string;
  nibel?: string;
  jumlahBidang?: number;
  noSU?: string;
  notes?: string;
}

export interface ValidatePemetaanRequest {
  notes?: string;
}

export interface AssignKKSRequest {
  kksId: string;
}

export interface ApproveBerkasRequest {
  notes?: string;
}

export interface ReviseBerkasRequest {
  revisionTarget: BerkasStatus;
  reason: string;
}
