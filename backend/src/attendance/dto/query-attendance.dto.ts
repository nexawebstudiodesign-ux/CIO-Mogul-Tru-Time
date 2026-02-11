import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryAttendanceDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
