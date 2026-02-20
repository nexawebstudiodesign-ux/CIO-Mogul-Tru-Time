import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { RolesGuard } from '../common/roles.guard';
import { SendMonthlyReportDto } from './dto/send-monthly-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-summary')
  @Roles(Role.ADMIN)
  getMonthlySummary(@Query('month') month: string) {
    return this.reportsService.buildMonthlySummary(month);
  }

  @Get('monthly-summary/csv')
  @Roles(Role.ADMIN)
  async downloadMonthlySummaryCsv(@Query('month') month: string, @Res() res: Response) {
    const csv = await this.reportsService.getMonthlySummaryCsv(month);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${month}.csv"`);
    res.send(csv);
  }

  @Post('monthly-summary/email')
  @Roles(Role.ADMIN)
  sendMonthlySummaryEmail(@Body() dto: SendMonthlyReportDto) {
    return this.reportsService.sendMonthlySummaryEmail(dto.month, dto.to);
  }
}
