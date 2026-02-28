import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { AdminCreateLeaveDto } from './dto/admin-create-leave.dto';
import { AdminUpdateLeaveDto } from './dto/admin-update-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';

@Injectable()
export class LeaveService {
  private static readonly MAX_LEAVE_BALANCE = 12;

  constructor(private supabaseService: SupabaseService) {}

  async adminCreateLeave(dto: AdminCreateLeaveDto) {
    await this.applyMonthlyAccrualForUser(dto.userId);

    const fromDate = this.normalizeDate(dto.fromDate);
    const toDate = this.normalizeDate(dto.toDate);
    if (toDate < fromDate) {
      throw new BadRequestException('To date must be after from date');
    }

    if (dto.status === 'APPROVED') {
      await this.adjustLeaveBalance(dto.userId, 0, this.countDays(fromDate, toDate), dto.leaveType);
    }

    const { data: leave, error } = await this.supabaseService.client
      .from('leaves')
      .insert({
        user_id: dto.userId,
        leave_type: dto.leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason: dto.reason,
        status: dto.status,
      })
      .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
      .single();
    if (error || !leave) {
      throw new BadRequestException('Unable to create leave');
    }
    return leave;
  }

  async applyLeave(userId: string, dto: ApplyLeaveDto) {
    await this.applyMonthlyAccrualForUser(userId);

    const fromDate = this.normalizeDate(dto.fromDate);
    const toDate = this.normalizeDate(dto.toDate);
    const today = this.normalizeDate(new Date().toISOString());
    
    // Validation 1: To date must be after from date
    if (toDate < fromDate) {
      throw new BadRequestException('To date must be after from date');
    }

    // Validation 2: Only allow leave for current month or next month
    const todayDate = new Date();
    const currentYear = todayDate.getFullYear();
    const currentMonth = todayDate.getMonth();
    const [fromYear, fromMonth] = fromDate.split('-').map(Number);
    const [toYear, toMonth] = toDate.split('-').map(Number);
    
    const fromMonthDiff = (fromYear - currentYear) * 12 + (fromMonth - currentMonth - 1);
    const toMonthDiff = (toYear - currentYear) * 12 + (toMonth - currentMonth - 1);
    
    if (fromMonthDiff > 1 || toMonthDiff > 1) {
      throw new BadRequestException('You can only apply for leave in the current month or next month');
    }

    // Validation 3: Cannot apply leave for dates older than 7 days
    const daysDifference = this.calculateDaysDifference(fromDate, today);
    if (fromDate < today && daysDifference > 7) {
      throw new BadRequestException('Cannot apply leave for dates older than 7 days');
    }

    // Validation 4: Check for overlapping leaves
    const { data: existingLeaves, error: overlapError } = await this.supabaseService.client
      .from('leaves')
      .select('id,from_date,to_date,status')
      .eq('user_id', userId)
      .or(`status.eq.PENDING,status.eq.APPROVED`)
      .gte('to_date', fromDate)
      .lte('from_date', toDate);
    
    if (overlapError) {
      throw new BadRequestException('Unable to validate leave dates');
    }
    
    if (existingLeaves && existingLeaves.length > 0) {
      throw new BadRequestException('You already have a pending or approved leave during this period');
    }

    // Validation 5: Check leave balance (no deduction until admin approves)
    if (dto.leaveType === 'CASUAL' || dto.leaveType === 'SICK') {
      const { data: user, error: userError } = await this.supabaseService.client
        .from('users')
        .select('id,casual_balance,sick_balance')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError || !user) {
        throw new NotFoundException('User not found');
      }

      const requestedDays = this.countDays(fromDate, toDate);
      const balance = dto.leaveType === 'CASUAL' ? user.casual_balance : user.sick_balance;
      if (balance < requestedDays) {
        throw new BadRequestException(
          `Insufficient leave balance. You have ${balance} days available but requesting ${requestedDays} days. Please apply for PAID leave instead, or kindly contact Admin at info@theciomogul.com for assistance.`
        );
      }
    }

    // Validation 6: Minimum reason length
    if (dto.reason.trim().length < 10) {
      throw new BadRequestException('Leave reason must be at least 10 characters');
    }

    const { data: leave, error } = await this.supabaseService.client
      .from('leaves')
      .insert({
        user_id: userId,
        leave_type: dto.leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason: dto.reason,
        status: 'PENDING',
      })
      .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
      .single();
    if (error || !leave) {
      throw new BadRequestException('Unable to apply leave');
    }
    return leave;
  }

  async listMyLeaves(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('leaves')
      .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      throw new BadRequestException('Unable to load leave requests');
    }
    return data ?? [];
  }

  async listAllLeaves(status?: string) {
    let request = this.supabaseService.client
      .from('leaves')
      .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at,users(id,name,employee_id,casual_balance,sick_balance)')
      .order('created_at', { ascending: false });
    if (status) {
      request = request.eq('status', status);
    }
    const { data, error } = await request;
    if (error) {
      throw new BadRequestException('Unable to load leave requests');
    }
    return data ?? [];
  }

  async updateStatus(leaveId: string, dto: UpdateLeaveStatusDto) {
    const { data: leave, error: leaveError } = await this.supabaseService.client
      .from('leaves')
      .select('id,user_id,leave_type,from_date,to_date,reason,status')
      .eq('id', leaveId)
      .maybeSingle();
    if (leaveError || !leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status === 'APPROVED' || leave.status === 'REJECTED') {
      return leave;
    }

    await this.applyMonthlyAccrualForUser(leave.user_id);

    // When approving a leave, deduct the balance for CASUAL/SICK leaves
    if (dto.status === 'APPROVED' && (leave.leave_type === 'CASUAL' || leave.leave_type === 'SICK')) {
      const days = this.countDays(leave.from_date, leave.to_date);
      const { data: user, error: userError } = await this.supabaseService.client
        .from('users')
        .select('id,casual_balance,sick_balance')
        .eq('id', leave.user_id)
        .maybeSingle();
      if (userError || !user) {
        throw new NotFoundException('User not found');
      }
      const balance = leave.leave_type === 'CASUAL' ? user.casual_balance : user.sick_balance;
      if (balance < days) {
        throw new BadRequestException(`Insufficient leave balance. User has ${balance} days but leave requires ${days} days.`);
      }
      const updatePayload = leave.leave_type === 'CASUAL'
        ? { casual_balance: user.casual_balance - days }
        : { sick_balance: user.sick_balance - days };
      const { error: updateBalanceError } = await this.supabaseService.client
        .from('users')
        .update(updatePayload)
        .eq('id', user.id);
      if (updateBalanceError) {
        throw new BadRequestException('Unable to deduct leave balance');
      }
    }
    
    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('leaves')
      .update({ status: dto.status })
      .eq('id', leaveId)
      .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
      .single();
    if (updateError || !updated) {
      throw new BadRequestException('Unable to update leave status');
    }
    return updated;
  }

  async cancelLeave(userId: string, leaveId: string) {
    const { data: leave, error: leaveError } = await this.supabaseService.client
      .from('leaves')
      .select('id,user_id,leave_type,from_date,to_date,status')
      .eq('id', leaveId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (leaveError || !leave) {
      throw new NotFoundException('Leave request not found');
    }

    // Cannot cancel if already rejected
    if (leave.status === 'REJECTED') {
      throw new BadRequestException('Cannot cancel a rejected leave');
    }

    // Cannot cancel if end date has passed
    const today = this.normalizeDate(new Date().toISOString());
    if (leave.to_date < today) {
      throw new BadRequestException('Cannot cancel leave after the end date has passed');
    }

    // Restore balance only if leave was APPROVED (PENDING leaves have no deduction)
    if (leave.status === 'APPROVED' && (leave.leave_type === 'CASUAL' || leave.leave_type === 'SICK')) {
      const days = this.countDays(leave.from_date, leave.to_date);
      const { data: user, error: userError } = await this.supabaseService.client
        .from('users')
        .select('id,casual_balance,sick_balance')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError || !user) {
        throw new NotFoundException('User not found');
      }

      const updatePayload = leave.leave_type === 'CASUAL'
        ? { casual_balance: user.casual_balance + days }
        : { sick_balance: user.sick_balance + days };
      const { error: updateBalanceError } = await this.supabaseService.client
        .from('users')
        .update(updatePayload)
        .eq('id', userId);
      
      if (updateBalanceError) {
        throw new BadRequestException('Unable to restore leave balance');
      }
    }

    // Delete the leave record
    const { error: deleteError } = await this.supabaseService.client
      .from('leaves')
      .delete()
      .eq('id', leaveId);
    
    if (deleteError) {
      throw new BadRequestException('Unable to cancel leave');
    }

    return { message: 'Leave cancelled successfully', balanceRestored: leave.leave_type === 'CASUAL' || leave.leave_type === 'SICK' };
  }

  async adminUpdateLeave(leaveId: string, dto: AdminUpdateLeaveDto) {
    const { data: existing, error: existingError } = await this.supabaseService.client
      .from('leaves')
      .select('id,user_id,leave_type,from_date,to_date,reason,status')
      .eq('id', leaveId)
      .maybeSingle();
    if (existingError || !existing) {
      throw new NotFoundException('Leave request not found');
    }

    await this.applyMonthlyAccrualForUser(existing.user_id);

    const newFrom = dto.fromDate ? this.normalizeDate(dto.fromDate) : existing.from_date;
    const newTo = dto.toDate ? this.normalizeDate(dto.toDate) : existing.to_date;
    if (newTo < newFrom) {
      throw new BadRequestException('To date must be after from date');
    }

    const oldDays = existing.status === 'APPROVED' ? this.countDays(existing.from_date, existing.to_date) : 0;
    const newStatus = dto.status ?? existing.status;
    const newDays = newStatus === 'APPROVED' ? this.countDays(newFrom, newTo) : 0;

    if (oldDays !== newDays) {
      await this.adjustLeaveBalance(existing.user_id, oldDays, newDays, existing.leave_type);
    }

    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('leaves')
      .update({
        leave_type: dto.leaveType ?? existing.leave_type,
        from_date: newFrom,
        to_date: newTo,
        reason: dto.reason ?? existing.reason,
        status: newStatus,
      })
      .eq('id', leaveId)
      .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
      .single();
    if (updateError || !updated) {
      throw new BadRequestException('Unable to update leave');
    }
    return updated;
  }

  async adminDeleteLeave(leaveId: string) {
    const { data: existing, error: existingError } = await this.supabaseService.client
      .from('leaves')
      .select('id,user_id,leave_type,from_date,to_date,status')
      .eq('id', leaveId)
      .maybeSingle();
    if (existingError || !existing) {
      throw new NotFoundException('Leave request not found');
    }

    await this.applyMonthlyAccrualForUser(existing.user_id);

    if (existing.status === 'APPROVED') {
      const days = this.countDays(existing.from_date, existing.to_date);
      await this.adjustLeaveBalance(existing.user_id, days, 0, existing.leave_type);
    }

    const { error: deleteError } = await this.supabaseService.client
      .from('leaves')
      .delete()
      .eq('id', leaveId);
    if (deleteError) {
      throw new BadRequestException('Unable to delete leave');
    }
    return { message: 'Leave deleted' };
  }

  private normalizeDate(value: string) {
    const date = new Date(value);
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return utc.toISOString().slice(0, 10);
  }

  private countDays(fromDate: string, toDate: string) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diff = to.getTime() - from.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  private calculateDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1 + 'T00:00:00Z');
    const d2 = new Date(date2 + 'T00:00:00Z');
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  private async adjustLeaveBalance(userId: string, oldDays: number, newDays: number, leaveType: string) {
    await this.applyMonthlyAccrualForUser(userId);

    const delta = newDays - oldDays;
    if (delta === 0) {
      return;
    }
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id,casual_balance,sick_balance')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !user) {
      throw new NotFoundException('User not found');
    }
    const balance = leaveType === 'CASUAL' ? user.casual_balance : user.sick_balance;
    const newBalance = balance - delta;
    if (newBalance < 0) {
      throw new BadRequestException('Insufficient leave balance');
    }
    const updatePayload = leaveType === 'CASUAL'
      ? { casual_balance: newBalance }
      : { sick_balance: newBalance };
    const { error: updateError } = await this.supabaseService.client
      .from('users')
      .update(updatePayload)
      .eq('id', user.id);
    if (updateError) {
      throw new BadRequestException('Unable to update leave balance');
    }
  }

  private getCurrentAccrualMonth() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private async applyMonthlyAccrualForUser(userId: string) {
    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('id,casual_balance,sick_balance,last_leave_accrual_month')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (String(error.message ?? '').includes('last_leave_accrual_month')) {
        return;
      }
      throw new BadRequestException('Unable to process monthly leave accrual');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const month = this.getCurrentAccrualMonth();
    if ((user as { last_leave_accrual_month?: string }).last_leave_accrual_month === month) {
      return;
    }

    const casualBalance = Math.min(
      Number((user as { casual_balance?: number }).casual_balance ?? 0) + 1,
      LeaveService.MAX_LEAVE_BALANCE,
    );
    const sickBalance = Math.min(
      Number((user as { sick_balance?: number }).sick_balance ?? 0) + 1,
      LeaveService.MAX_LEAVE_BALANCE,
    );

    const { error: updateError } = await this.supabaseService.client
      .from('users')
      .update({
        casual_balance: casualBalance,
        sick_balance: sickBalance,
        last_leave_accrual_month: month,
      })
      .eq('id', userId);

    if (updateError) {
      throw new BadRequestException('Unable to process monthly leave accrual');
    }
  }
}
