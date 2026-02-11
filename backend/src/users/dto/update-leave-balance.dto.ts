import { IsInt, Min } from 'class-validator';

export class UpdateLeaveBalanceDto {
  @IsInt()
  @Min(0)
  leaveBalance: number;
}
