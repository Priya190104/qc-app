import { BerkasStatus } from '@prisma/client';

/**
 * Berkas Status Constants
 * Re-export BerkasStatus enum from Prisma
 */
export { BerkasStatus } from '@prisma/client';

export const BERKAS_STATUS_LABELS = {
  [BerkasStatus.DIBUAT]: 'Dibuat',
  [BerkasStatus.DI_OPERATOR_DATA_UKUR]: 'Di Operator Data Ukur',
  [BerkasStatus.DI_PETUGAS_UKUR]: 'Di Petugas Ukur',
  [BerkasStatus.DI_OPERATOR_DATA_PEMETAAN]: 'Di Operator Data Pemetaan',
  [BerkasStatus.DI_PETUGAS_PEMETAAN]: 'Di Petugas Pemetaan',
  [BerkasStatus.PEMILIHAN_KKS]: 'Pemilihan KKS',
  [BerkasStatus.DI_KKS]: 'Di KKS',
  [BerkasStatus.REVISI_KKS]: 'Revisi dari KKS',
  [BerkasStatus.DI_KEPALA_SEKSI]: 'Di Kepala Seksi',
  [BerkasStatus.REVISI_KASI]: 'Revisi dari Kepala Seksi',
  [BerkasStatus.SELESAI]: 'Selesai',
  [BerkasStatus.DITUTUP]: 'Ditutup',
};

export const VALID_STATUS_VALUES = Object.values(BerkasStatus);

/**
 * Status transitions - valid next status for each current status
 */
export const STATUS_TRANSITIONS: Record<BerkasStatus, BerkasStatus[]> = {
  [BerkasStatus.DIBUAT]: [BerkasStatus.DI_OPERATOR_DATA_UKUR],
  [BerkasStatus.DI_OPERATOR_DATA_UKUR]: [BerkasStatus.DI_PETUGAS_UKUR],
  [BerkasStatus.DI_PETUGAS_UKUR]: [BerkasStatus.DI_OPERATOR_DATA_PEMETAAN],
  [BerkasStatus.DI_OPERATOR_DATA_PEMETAAN]: [BerkasStatus.DI_PETUGAS_PEMETAAN],
  [BerkasStatus.DI_PETUGAS_PEMETAAN]: [BerkasStatus.PEMILIHAN_KKS],
  [BerkasStatus.PEMILIHAN_KKS]: [BerkasStatus.DI_KKS],
  [BerkasStatus.DI_KKS]: [
    BerkasStatus.DI_KEPALA_SEKSI, // ACC
    BerkasStatus.REVISI_KKS, // Revisi ke Petugas Ukur/Pemetaan
  ],
  [BerkasStatus.REVISI_KKS]: [
    BerkasStatus.DI_KKS, // Selesai revisi, kembali ke KKS
  ],
  [BerkasStatus.DI_KEPALA_SEKSI]: [
    BerkasStatus.SELESAI, // ACC
    BerkasStatus.REVISI_KASI, // Revisi ke Petugas Ukur/Pemetaan
    BerkasStatus.DI_KKS, // Revisi langsung dikembalikan ke KKS
  ],
  [BerkasStatus.REVISI_KASI]: [
    BerkasStatus.DI_KEPALA_SEKSI, // Selesai revisi, kembali ke Kepala Seksi
  ],
  [BerkasStatus.SELESAI]: [],
  [BerkasStatus.DITUTUP]: [],
};

/**
 * Check if status transition is valid
 */
export function isValidTransition(currentStatus: BerkasStatus, newStatus: BerkasStatus): boolean {
  const validTransitions = STATUS_TRANSITIONS[currentStatus];
  return validTransitions.includes(newStatus);
}

/**
 * Get revision targets for specific status
 * Maps which roles can receive revision from KKS/Kepala Seksi
 */
export const REVISION_TARGETS: Record<string, string[]> = {
  [BerkasStatus.DI_KKS]: ['PETUGAS_UKUR', 'PETUGAS_PEMETAAN'],
  [BerkasStatus.DI_KEPALA_SEKSI]: ['PETUGAS_UKUR', 'PETUGAS_PEMETAAN', 'KKS'],
};
