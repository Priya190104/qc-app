import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreatePetugasDto {
  @IsString()
  @MinLength(2)
  nama!: string;

  @IsString()
  nip!: string;

  @IsOptional()
  @IsString()
  departemen?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
