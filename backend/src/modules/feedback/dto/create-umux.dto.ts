import { IsInt, Min, Max } from 'class-validator';

export class CreateUmuxDto {
  @IsInt()
  @Min(1)
  @Max(7)
  q1!: number;

  @IsInt()
  @Min(1)
  @Max(7)
  q2!: number;

  @IsInt()
  @Min(1)
  @Max(7)
  q3!: number;

  @IsInt()
  @Min(1)
  @Max(7)
  q4!: number;
}
