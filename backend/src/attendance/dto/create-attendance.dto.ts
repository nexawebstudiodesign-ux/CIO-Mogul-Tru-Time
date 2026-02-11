import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateAttendanceDto {
  @IsDateString()
  date: string;

  @IsDateString()
  loginTime: string;

  @IsDateString()
  logoutTime: string;

  @IsInt()
  @Min(0)
  mailsCount: number;

  @IsInt()
  @Min(0)
  dataCount: number;

  @IsInt()
  @Min(0)
  linkedinCount: number;

  @IsInt()
  @Min(0)
  followUpCount: number;
}
