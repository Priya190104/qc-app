import {
  IsString,
  IsInt,
  IsOptional,
  IsISO8601,
  IsUUID,
  IsNumber,
  IsEnum,
  Matches,
} from 'class-validator';
import { BerkasStatus } from '@prisma/client';

export class CreateBerkasDto {
  @IsString()
  @Matches(/^\d+\/\d{4}$/, {
    message: 'nomor harus dalam format: angka/tahun (contoh: 123/2026)',
  })
  nomor!: string;

  @IsOptional()
  @IsString()
  kegiatan?: string;

  @IsOptional()
  @IsString()
  tanggalBerkas?: string;

  @IsOptional()
  @IsInt()
  tahunBerkas?: number;

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
  @IsInt()
  luasPendaftaran?: number;

  @IsOptional()
  @IsString()
  di302?: string;

  @IsOptional()
  @IsString()
  di305?: string;

  @IsOptional()
  @IsString()
  kks?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsEnum(BerkasStatus)
  status?: BerkasStatus;
}

export class UpdateBerkasDto {
  @IsOptional()
  @IsString()
  kegiatan?: string;

  @IsOptional()
  @IsString()
  tanggalBerkas?: string;

  @IsOptional()
  @IsInt()
  tahunBerkas?: number;

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
  @IsInt()
  luasPendaftaran?: number;

  @IsOptional()
  @IsString()
  di302?: string;

  @IsOptional()
  @IsString()
  di305?: string;

  @IsOptional()
  @IsString()
  kks?: string;

  @IsOptional()
  @IsEnum(BerkasStatus)
  status?: BerkasStatus;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  // KKS Workflow Fields
  @IsOptional()
  @IsUUID()
  petugasUkurId?: string;

  @IsOptional()
  @IsUUID()
  puLapangId?: string;

  @IsOptional()
  @IsString()
  noSTP?: string;

  @IsOptional()
  @IsISO8601()
  tglSTP?: string;

  @IsOptional()
  @IsString()
  noSHATNIBEL?: string;

  @IsOptional()
  @IsInt()
  luasHasilUkur?: number;

  @IsOptional()
  @IsString()
  nib?: string;

  @IsOptional()
  @IsString()
  nibel?: string;

  @IsOptional()
  @IsInt()
  jumlahBidang?: number;

  @IsOptional()
  @IsString()
  noSU?: string;
}
