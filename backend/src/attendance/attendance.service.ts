import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

@Injectable()
export class AttendanceService {
  private readonly MAX_DAYS_OLD = 7; // Configurable: maximum days old for attendance marking

  constructor(private supabaseService: SupabaseService) {}

  async createAttendance(userId: string, dto: CreateAttendanceDto) {
    const date = this.normalizeDate(dto.date);
    const today = this.normalizeDate(new Date().toISOString());
    
    // Validation 1: Cannot mark attendance for future dates
    if (date > today) {
      throw new BadRequestException('Cannot mark attendance for future dates');
    }
    
    // Validation 2: Cannot mark attendance older than 7 days
    const daysDifference = this.calculateDaysDifference(date, today);
    if (daysDifference > this.MAX_DAYS_OLD) {
      throw new BadRequestException(`Cannot mark attendance older than ${this.MAX_DAYS_OLD} days`);
    }
    
    // Validation 3: Cannot mark attendance for weekends
    if (this.isWeekend(date)) {
      throw new BadRequestException('Cannot mark attendance for weekends (Saturday/Sunday)');
    }
    
    // Validation 4: Cannot mark attendance for holidays
    if (await this.isHoliday(date)) {
      throw new BadRequestException('Cannot mark attendance for holidays');
    }

    const loginTime = new Date(dto.loginTime);
    const logoutTime = new Date(dto.logoutTime);

    if (logoutTime <= loginTime) {
      throw new BadRequestException('Logout must be after login');
    }
    
    // Validation 5: Working hours should be reasonable (4-16 hours)
    const totalMinutes = Math.round((logoutTime.getTime() - loginTime.getTime()) / 60000);
    const totalHours = totalMinutes / 60;
    if (totalHours < 4) {
      throw new BadRequestException('Minimum working hours is 4 hours');
    }
    if (totalHours > 16) {
      throw new BadRequestException('Maximum working hours is 16 hours. Please verify your login/logout times.');
    }

    const { data: existing, error: existingError } = await this.supabaseService.client
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    if (existingError) {
      throw new BadRequestException('Unable to validate attendance');
    }
    if (existing) {
      throw new BadRequestException('Attendance already submitted for this date');
    }

    const { data: attendance, error: createError } = await this.supabaseService.client
      .from('attendance')
      .insert({
        user_id: userId,
        date,
        login_time: loginTime.toISOString(),
        logout_time: logoutTime.toISOString(),
        total_minutes: totalMinutes,
        mails_count: dto.mailsCount,
        data_count: dto.dataCount,
        linkedin_count: dto.linkedinCount,
        follow_up_count: dto.followUpCount,
      })
      .select('id,user_id,date,login_time,logout_time,total_minutes,mails_count,data_count,linkedin_count,follow_up_count,created_at,users(id,name,employee_id)')
      .single();
    if (createError || !attendance) {
      throw new BadRequestException('Unable to create attendance');
    }
    return attendance;
  }

  async listAttendance(query: QueryAttendanceDto) {
    let request = this.supabaseService.client
      .from('attendance')
      .select('id,user_id,date,login_time,logout_time,total_minutes,mails_count,data_count,linkedin_count,follow_up_count,created_at,users(id,name,employee_id)')
      .order('date', { ascending: false });
    if (query.userId) {
      request = request.eq('user_id', query.userId);
    }
    if (query.dateFrom) {
      request = request.gte('date', this.normalizeDate(query.dateFrom));
    }
    if (query.dateTo) {
      request = request.lte('date', this.normalizeDate(query.dateTo));
    }
    const { data, error } = await request;
    if (error) {
      throw new BadRequestException('Unable to load attendance records');
    }
    return data ?? [];
  }

  async listMyAttendance(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('attendance')
      .select('id,user_id,date,login_time,logout_time,total_minutes,mails_count,data_count,linkedin_count,follow_up_count,created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) {
      throw new BadRequestException('Unable to load attendance records');
    }
    return data ?? [];
  }

  private normalizeDate(value: string) {
    const date = new Date(value);
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return utc.toISOString().slice(0, 10);
  }

  // Helper method to check if date is on weekend (Saturday = 6, Sunday = 0)
  private isWeekend(dateString: string): boolean {
    const date = new Date(dateString + 'T00:00:00Z');
    const dayOfWeek = date.getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  // Helper method to check if date is a holiday
  private async isHoliday(dateString: string): Promise<boolean> {
    const { data, error } = await this.supabaseService.client
      .from('public_holidays')
      .select('id')
      .eq('date', dateString)
      .maybeSingle();
    if (error) {
      throw new BadRequestException('Unable to validate attendance date');
    }
    return !!data;
  }

  // Helper method to calculate days difference between two dates
  private calculateDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1 + 'T00:00:00Z');
    const d2 = new Date(date2 + 'T00:00:00Z');
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
