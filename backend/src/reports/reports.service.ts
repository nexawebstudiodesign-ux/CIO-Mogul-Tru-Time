import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SupabaseService } from '../supabase/supabase.service';

type UserRow = {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  is_active: boolean;
};

type AttendanceRow = {
  user_id: string;
  total_minutes: number;
};

type SalaryRow = {
  user_id: string;
  base_salary: number;
  hra: number;
  transport_allowance: number;
  other_allowance: number;
  performance_bonus: number;
  pf_deduction: number;
  tax_deduction: number;
  other_deduction: number;
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  private toMonthBounds(month: string) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const start = `${month}-01`;
    const endDate = new Date(`${start}T00:00:00.000Z`);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    const end = endDate.toISOString().slice(0, 10);
    return { start, end };
  }

  private buildCsv(rows: Array<Record<string, string | number>>) {
    if (rows.length === 0) {
      return 'Employee ID,Name,Email,Attendance Entries,Total Hours,Compliance %,Gross Salary,Total Deductions,Net Salary\n';
    }

    const headers = Object.keys(rows[0]);
    const headerLine = headers.join(',');
    const lines = rows.map((row) =>
      headers
        .map((key) => {
          const value = row[key] ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    return `${headerLine}\n${lines.join('\n')}`;
  }

  async buildMonthlySummary(month: string) {
    const { start, end } = this.toMonthBounds(month);

    const { data: users, error: usersError } = await this.supabase.client
      .from('users')
      .select('id,name,email,employee_id,is_active')
      .eq('is_active', true)
      .order('employee_id', { ascending: true });

    if (usersError) {
      throw new BadRequestException('Unable to load users for report');
    }

    const { data: attendance, error: attendanceError } = await this.supabase.client
      .from('attendance')
      .select('user_id,total_minutes,date')
      .gte('date', start)
      .lt('date', end);

    if (attendanceError) {
      throw new BadRequestException('Unable to load attendance for report');
    }

    const { data: salaries, error: salariesError } = await this.supabase.client
      .from('monthly_salaries')
      .select('user_id,base_salary,hra,transport_allowance,other_allowance,performance_bonus,pf_deduction,tax_deduction,other_deduction,month')
      .eq('month', start);

    if (salariesError) {
      throw new BadRequestException('Unable to load salaries for report');
    }

    const attendanceByUser = new Map<string, AttendanceRow[]>();
    for (const row of (attendance ?? []) as AttendanceRow[]) {
      const list = attendanceByUser.get(row.user_id) ?? [];
      list.push(row);
      attendanceByUser.set(row.user_id, list);
    }

    const salaryByUser = new Map<string, SalaryRow>();
    for (const row of (salaries ?? []) as SalaryRow[]) {
      salaryByUser.set(row.user_id, row);
    }

    const records = ((users ?? []) as UserRow[]).map((user) => {
      const userAttendance = attendanceByUser.get(user.id) ?? [];
      const entries = userAttendance.length;
      const totalHours = userAttendance.reduce((sum, row) => sum + (Number(row.total_minutes || 0) / 60), 0);
      const compliantDays = userAttendance.filter((row) => Number(row.total_minutes || 0) >= 270).length;
      const compliance = entries > 0 ? Math.round((compliantDays / entries) * 100) : 0;

      const salary = salaryByUser.get(user.id);
      const gross = salary
        ? Number(salary.base_salary || 0) +
          Number(salary.hra || 0) +
          Number(salary.transport_allowance || 0) +
          Number(salary.other_allowance || 0) +
          Number(salary.performance_bonus || 0)
        : 0;
      const deductions = salary
        ? Number(salary.pf_deduction || 0) + Number(salary.tax_deduction || 0) + Number(salary.other_deduction || 0)
        : 0;
      const net = gross - deductions;

      return {
        userId: user.id,
        employeeId: user.employee_id,
        name: user.name,
        email: user.email,
        attendanceEntries: entries,
        totalHours: Math.round(totalHours * 10) / 10,
        compliance,
        grossSalary: gross,
        totalDeductions: deductions,
        netSalary: net,
      };
    });

    const totals = records.reduce(
      (acc, row) => ({
        employees: acc.employees + 1,
        attendanceEntries: acc.attendanceEntries + row.attendanceEntries,
        grossSalary: acc.grossSalary + row.grossSalary,
        totalDeductions: acc.totalDeductions + row.totalDeductions,
        netSalary: acc.netSalary + row.netSalary,
      }),
      { employees: 0, attendanceEntries: 0, grossSalary: 0, totalDeductions: 0, netSalary: 0 },
    );

    return {
      month,
      totals,
      records,
    };
  }

  async getMonthlySummaryCsv(month: string) {
    const summary = await this.buildMonthlySummary(month);
    const rows = summary.records.map((row) => ({
      'Employee ID': row.employeeId,
      Name: row.name,
      Email: row.email,
      'Attendance Entries': row.attendanceEntries,
      'Total Hours': row.totalHours,
      'Compliance %': row.compliance,
      'Gross Salary': row.grossSalary,
      'Total Deductions': row.totalDeductions,
      'Net Salary': row.netSalary,
    }));

    return this.buildCsv(rows);
  }

  async sendMonthlySummaryEmail(month: string, to: string) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('REPORT_EMAIL_FROM') || user;

    if (!host || !user || !pass || !from) {
      throw new BadRequestException(
        'SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, REPORT_EMAIL_FROM.',
      );
    }

    const csv = await this.getMonthlySummaryCsv(month);
    const summary = await this.buildMonthlySummary(month);

    const transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject: `Monthly Compliance + Payroll Report (${month})`,
      text: `Please find attached the monthly compliance and payroll report for ${month}.\n\nEmployees: ${summary.totals.employees}\nTotal Net Payroll: ${summary.totals.netSalary}`,
      attachments: [
        {
          filename: `monthly-report-${month}.csv`,
          content: csv,
          contentType: 'text/csv',
        },
      ],
    });

    return { message: `Report sent to ${to}` };
  }
}
