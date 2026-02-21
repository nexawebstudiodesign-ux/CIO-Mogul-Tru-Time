import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateHolidayDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
