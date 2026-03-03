import api from './api';
import {
  Berkas,
  BerkasStatus,
  BerkasHistory,
  UpdateDataUkurRequest,
  ValidatePengukuranRequest,
  UpdateDataPemetaanRequest,
  ValidatePemetaanRequest,
  AssignKKSRequest,
  ApproveBerkasRequest,
  ReviseBerkasRequest,
  ApiResponse,
} from '@/types';

/**
 * Berkas Workflow API Client
 * Handles all workflow-related operations for berkas processing
 */

// Get berkas by status (for role-specific pages)
export const getBerkasByStatus = async (status: BerkasStatus): Promise<Berkas[]> => {
  const response = await api.get(`/berkas/workflow/status/${status}`);
  const apiResponse = response.data as ApiResponse<Berkas[]>;
  return apiResponse.data || [];
};

// Get berkas history/timeline
export const getBerkasHistory = async (berkasId: string): Promise<BerkasHistory[]> => {
  const response = await api.get(`/berkas/workflow/${berkasId}/history`);
  const apiResponse = response.data as ApiResponse<BerkasHistory[]>;
  return apiResponse.data || [];
};

// ==================== OPERATOR DATA UKUR ====================

/**
 * Update data ukur for a berkas
 */
export const updateDataUkur = async (
  berkasId: string,
  data: UpdateDataUkurRequest
): Promise<Berkas> => {
  const response = await api.put(`/berkas/workflow/${berkasId}/operator-ukur/update`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

/**
 * Move berkas from Operator Data Ukur to Petugas Ukur
 */
export const lanjutkanKePetugasUkur = async (berkasId: string): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/operator-ukur/lanjutkan`);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== PETUGAS UKUR ====================

/**
 * Validate pengukuran and move to Operator Data Pemetaan
 */
export const validatePengukuran = async (
  berkasId: string,
  data: ValidatePengukuranRequest
): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/petugas-ukur/validate`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== OPERATOR DATA PEMETAAN ====================

/**
 * Update data pemetaan for a berkas
 */
export const updateDataPemetaan = async (
  berkasId: string,
  data: UpdateDataPemetaanRequest
): Promise<Berkas> => {
  const response = await api.put(`/berkas/workflow/${berkasId}/operator-pemetaan/update`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

/**
 * Move berkas from Operator Data Pemetaan to Petugas Pemetaan
 */
export const lanjutkanKePetugasPemetaan = async (berkasId: string): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/operator-pemetaan/lanjutkan`);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== PETUGAS PEMETAAN ====================

/**
 * Validate pemetaan and move to Pemilihan KKS
 */
export const validatePemetaan = async (
  berkasId: string,
  data: ValidatePemetaanRequest
): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/petugas-pemetaan/validate`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== OPERATOR DATA BERKAS - KKS ASSIGNMENT ====================

/**
 * Assign KKS to berkas and move to DI_KKS status
 */
export const assignKKS = async (berkasId: string, data: AssignKKSRequest): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/assign-kks`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== KKS ====================

/**
 * KKS approves berkas (ACC) - moves to Kepala Seksi
 */
export const approveByKKS = async (
  berkasId: string,
  data: ApproveBerkasRequest
): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/kks/approve`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

/**
 * KKS revises berkas - sends back to specific status
 */
export const reviseByKKS = async (berkasId: string, data: ReviseBerkasRequest): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/kks/revise`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== KEPALA SEKSI ====================

/**
 * Kepala Seksi approves berkas (ACC) - marks as SELESAI
 */
export const approveByKepalaSeksi = async (
  berkasId: string,
  data: ApproveBerkasRequest
): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/kepala-seksi/approve`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

/**
 * Kepala Seksi revises berkas - sends back to specific status
 */
export const reviseByKepalaSeksi = async (
  berkasId: string,
  data: ReviseBerkasRequest
): Promise<Berkas> => {
  const response = await api.post(`/berkas/workflow/${berkasId}/kepala-seksi/revise`, data);
  const apiResponse = response.data as ApiResponse<Berkas>;
  return apiResponse.data!;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get revision targets for KKS
 */
export const getKKSRevisionTargets = (): BerkasStatus[] => {
  return [
    BerkasStatus.DI_OPERATOR_DATA_UKUR,
    BerkasStatus.DI_PETUGAS_UKUR,
    BerkasStatus.DI_OPERATOR_DATA_PEMETAAN,
    BerkasStatus.DI_PETUGAS_PEMETAAN,
  ];
};

/**
 * Get revision targets for Kepala Seksi
 */
export const getKepalaSeksiRevisionTargets = (): BerkasStatus[] => {
  return [
    BerkasStatus.DI_OPERATOR_DATA_UKUR,
    BerkasStatus.DI_PETUGAS_UKUR,
    BerkasStatus.DI_OPERATOR_DATA_PEMETAAN,
    BerkasStatus.DI_PETUGAS_PEMETAAN,
    BerkasStatus.DI_KKS,
  ];
};

/**
 * Check if status is a revision state
 */
export const isRevisionStatus = (berkas: Berkas): boolean => {
  return berkas.revisionCount > 0 && !!berkas.lastRevisionReason;
};

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (status: BerkasStatus): string => {
  const colors: Record<BerkasStatus, string> = {
    [BerkasStatus.DIBUAT]: 'bg-gray-100 text-gray-800',
    [BerkasStatus.DI_OPERATOR_DATA_UKUR]: 'bg-blue-100 text-blue-800',
    [BerkasStatus.DI_PETUGAS_UKUR]: 'bg-cyan-100 text-cyan-800',
    [BerkasStatus.DI_OPERATOR_DATA_PEMETAAN]: 'bg-green-100 text-green-800',
    [BerkasStatus.DI_PETUGAS_PEMETAAN]: 'bg-emerald-100 text-emerald-800',
    [BerkasStatus.PEMILIHAN_KKS]: 'bg-purple-100 text-purple-800',
    [BerkasStatus.DI_KKS]: 'bg-yellow-100 text-yellow-800',
    [BerkasStatus.DI_KEPALA_SEKSI]: 'bg-orange-100 text-orange-800',
    [BerkasStatus.SELESAI]: 'bg-green-100 text-green-800',
    [BerkasStatus.DITUTUP]: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
