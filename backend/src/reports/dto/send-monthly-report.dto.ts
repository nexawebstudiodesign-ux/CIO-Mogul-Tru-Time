import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendMonthlyReportDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month: string;

  @IsEmail()
  @IsNotEmpty()
  to: string;
}
