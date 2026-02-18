import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateLeaveBalanceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  leaveBalance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  casualBalance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sickBalance?: number;
}
