import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private supabaseService: SupabaseService) {}

  async createAttendance(userId: string, dto: CreateAttendanceDto) {
    const date = this.normalizeDate(dto.date);
    const loginTime = new Date(dto.loginTime);
    const logoutTime = new Date(dto.logoutTime);

    if (logoutTime <= loginTime) {
      throw new BadRequestException('Logout must be after login');
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

    const totalMinutes = Math.round((logoutTime.getTime() - loginTime.getTime()) / 60000);

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
}
