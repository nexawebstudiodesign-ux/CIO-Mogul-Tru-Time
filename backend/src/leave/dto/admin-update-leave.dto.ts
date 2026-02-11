import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class AdminUpdateLeaveDto {
  @IsOptional()
  @IsIn(['CASUAL', 'SICK', 'PAID'])
  leaveType?: 'CASUAL' | 'SICK' | 'PAID';

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
