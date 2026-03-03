import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BerkasStatus } from '@prisma/client';

/**
 * DTO for transitioning berkas to next status
 */
export class TransitionBerkasDto {
  @IsEnum(BerkasStatus)
  newStatus!: BerkasStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for KKS assignment
 */
export class AssignKKSDto {
  @IsUUID()
  petugasKKSId!: string;
}

/**
 * DTO for approval (ACC) action
 */
export class ApproveBerkasDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for revision action with target selection
 */
export class ReviseBerkasDto {
  @IsString()
  revisionTarget!: string; // 'PETUGAS_UKUR' | 'PETUGAS_PEMETAAN' | 'KKS'

  @IsString()
  reason!: string;
}

/**
 * DTO for updating berkas by Operator Data Ukur
 */
export class UpdateDataUkurDto {
  @IsOptional()
  @IsUUID()
  petugasUkurId?: string;

  @IsOptional()
  @IsString()
  noSTP?: string;

  @IsOptional()
  @IsString()
  tglSTP?: string;

  @IsOptional()
  @IsString()
  noSHATNIBEL?: string;

  @IsOptional()
  @IsString()
  kegiatan?: string;

  @IsOptional()
  @IsString()
  namaPemohon?: string;

  @IsOptional()
  @IsString()
  kecamatan?: string;

  @IsOptional()
  @IsString()
  desa?: string;

  @IsOptional()
  @IsString()
  namaProsedur?: string;

  @IsOptional()
  luasPendaftaran?: number | string;
}

/**
 * DTO for validating berkas by Petugas Ukur
 */
export class ValidatePengukuranDto {
  @IsOptional()
  @IsUUID()
  puLapangId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating berkas by Operator Data Pemetaan
 */
export class UpdateDataPemetaanDto {
  @IsOptional()
  @IsUUID()
  petugasPemetaanId?: string;

  @IsOptional()
  luasHasilUkur?: number;

  @IsOptional()
  @IsString()
  nib?: string;

  @IsOptional()
  @IsString()
  nibel?: string;

  @IsOptional()
  jumlahBidang?: number;

  @IsOptional()
  @IsString()
  noSU?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for validating berkas by Petugas Pemetaan
 */
export class ValidatePemetaanDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
