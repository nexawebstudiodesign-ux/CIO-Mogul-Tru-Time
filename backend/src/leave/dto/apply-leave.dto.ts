import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ApplyLeaveDto {
  @IsIn(['CASUAL', 'SICK', 'PAID'])
  leaveType: 'CASUAL' | 'SICK' | 'PAID';

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
