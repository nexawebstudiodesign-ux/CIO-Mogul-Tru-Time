import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AdminCreateLeaveDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(['CASUAL', 'SICK', 'PAID'])
  leaveType: 'CASUAL' | 'SICK' | 'PAID';

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
