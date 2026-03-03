import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePetugasDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  nip?: string;

  @IsOptional()
  @IsString()
  departemen?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
