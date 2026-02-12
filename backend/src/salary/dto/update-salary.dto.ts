import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateMonthlySalaryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  workingDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hra?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  transportAllowance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherAllowance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  performanceBonus?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pfDeduction?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxDeduction?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeduction?: number;
}
