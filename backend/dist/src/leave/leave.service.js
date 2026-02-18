"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let LeaveService = class LeaveService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async adminCreateLeave(dto) {
        const fromDate = this.normalizeDate(dto.fromDate);
        const toDate = this.normalizeDate(dto.toDate);
        if (toDate < fromDate) {
            throw new common_1.BadRequestException('To date must be after from date');
        }
        if (dto.status === 'APPROVED') {
            await this.adjustLeaveBalance(dto.userId, 0, this.countDays(fromDate, toDate));
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
            throw new common_1.BadRequestException('Unable to create leave');
        }
        return leave;
    }
    async applyLeave(userId, dto) {
        const fromDate = this.normalizeDate(dto.fromDate);
        const toDate = this.normalizeDate(dto.toDate);
        const today = this.normalizeDate(new Date().toISOString());
        if (toDate < fromDate) {
            throw new common_1.BadRequestException('To date must be after from date');
        }
        const todayDate = new Date();
        const currentYear = todayDate.getFullYear();
        const currentMonth = todayDate.getMonth();
        const [fromYear, fromMonth] = fromDate.split('-').map(Number);
        const [toYear, toMonth] = toDate.split('-').map(Number);
        const fromMonthDiff = (fromYear - currentYear) * 12 + (fromMonth - currentMonth - 1);
        const toMonthDiff = (toYear - currentYear) * 12 + (toMonth - currentMonth - 1);
        if (fromMonthDiff > 1 || toMonthDiff > 1) {
            throw new common_1.BadRequestException('You can only apply for leave in the current month or next month');
        }
        const daysDifference = this.calculateDaysDifference(fromDate, today);
        if (fromDate < today && daysDifference > 7) {
            throw new common_1.BadRequestException('Cannot apply leave for dates older than 7 days');
        }
        const { data: existingLeaves, error: overlapError } = await this.supabaseService.client
            .from('leaves')
            .select('id,from_date,to_date,status')
            .eq('user_id', userId)
            .or(`status.eq.PENDING,status.eq.APPROVED`)
            .gte('to_date', fromDate)
            .lte('from_date', toDate);
        if (overlapError) {
            throw new common_1.BadRequestException('Unable to validate leave dates');
        }
        if (existingLeaves && existingLeaves.length > 0) {
            throw new common_1.BadRequestException('You already have a pending or approved leave during this period');
        }
        if (dto.leaveType === 'CASUAL' || dto.leaveType === 'SICK') {
            const { data: user, error: userError } = await this.supabaseService.client
                .from('users')
                .select('id,leave_balance')
                .eq('id', userId)
                .maybeSingle();
            if (userError || !user) {
                throw new common_1.NotFoundException('User not found');
            }
            const requestedDays = this.countDays(fromDate, toDate);
            if (user.leave_balance < requestedDays) {
                throw new common_1.BadRequestException(`Insufficient leave balance. You have ${user.leave_balance} days available but requesting ${requestedDays} days. Please apply for PAID leave instead, or kindly contact Admin at info@theciomogul.com for assistance.`);
            }
            const { error: updateError } = await this.supabaseService.client
                .from('users')
                .update({ leave_balance: user.leave_balance - requestedDays })
                .eq('id', userId);
            if (updateError) {
                throw new common_1.BadRequestException('Unable to update leave balance');
            }
        }
        if (dto.reason.trim().length < 10) {
            throw new common_1.BadRequestException('Leave reason must be at least 10 characters');
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
            throw new common_1.BadRequestException('Unable to apply leave');
        }
        return leave;
    }
    async listMyLeaves(userId) {
        const { data, error } = await this.supabaseService.client
            .from('leaves')
            .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException('Unable to load leave requests');
        }
        return data ?? [];
    }
    async listAllLeaves(status) {
        let request = this.supabaseService.client
            .from('leaves')
            .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at,users(id,name,employee_id,leave_balance)')
            .order('created_at', { ascending: false });
        if (status) {
            request = request.eq('status', status);
        }
        const { data, error } = await request;
        if (error) {
            throw new common_1.BadRequestException('Unable to load leave requests');
        }
        return data ?? [];
    }
    async updateStatus(leaveId, dto) {
        const { data: leave, error: leaveError } = await this.supabaseService.client
            .from('leaves')
            .select('id,user_id,leave_type,from_date,to_date,reason,status')
            .eq('id', leaveId)
            .maybeSingle();
        if (leaveError || !leave) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        if (leave.status === 'APPROVED' || leave.status === 'REJECTED') {
            return leave;
        }
        if (dto.status === 'REJECTED' && (leave.leave_type === 'CASUAL' || leave.leave_type === 'SICK')) {
            const days = this.countDays(leave.from_date, leave.to_date);
            const { data: user, error: userError } = await this.supabaseService.client
                .from('users')
                .select('id,leave_balance')
                .eq('id', leave.user_id)
                .maybeSingle();
            if (userError || !user) {
                throw new common_1.NotFoundException('User not found');
            }
            const { error: updateBalanceError } = await this.supabaseService.client
                .from('users')
                .update({ leave_balance: user.leave_balance + days })
                .eq('id', user.id);
            if (updateBalanceError) {
                throw new common_1.BadRequestException('Unable to restore leave balance');
            }
        }
        const { data: updated, error: updateError } = await this.supabaseService.client
            .from('leaves')
            .update({ status: dto.status })
            .eq('id', leaveId)
            .select('id,user_id,leave_type,from_date,to_date,reason,status,created_at')
            .single();
        if (updateError || !updated) {
            throw new common_1.BadRequestException('Unable to update leave status');
        }
        return updated;
    }
    async cancelLeave(userId, leaveId) {
        const { data: leave, error: leaveError } = await this.supabaseService.client
            .from('leaves')
            .select('id,user_id,leave_type,from_date,to_date,status')
            .eq('id', leaveId)
            .eq('user_id', userId)
            .maybeSingle();
        if (leaveError || !leave) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        if (leave.status === 'REJECTED') {
            throw new common_1.BadRequestException('Cannot cancel a rejected leave');
        }
        const today = this.normalizeDate(new Date().toISOString());
        if (leave.to_date < today) {
            throw new common_1.BadRequestException('Cannot cancel leave after the end date has passed');
        }
        if ((leave.status === 'PENDING' || leave.status === 'APPROVED') &&
            (leave.leave_type === 'CASUAL' || leave.leave_type === 'SICK')) {
            const days = this.countDays(leave.from_date, leave.to_date);
            const { data: user, error: userError } = await this.supabaseService.client
                .from('users')
                .select('id,leave_balance')
                .eq('id', userId)
                .maybeSingle();
            if (userError || !user) {
                throw new common_1.NotFoundException('User not found');
            }
            const { error: updateBalanceError } = await this.supabaseService.client
                .from('users')
                .update({ leave_balance: user.leave_balance + days })
                .eq('id', userId);
            if (updateBalanceError) {
                throw new common_1.BadRequestException('Unable to restore leave balance');
            }
        }
        const { error: deleteError } = await this.supabaseService.client
            .from('leaves')
            .delete()
            .eq('id', leaveId);
        if (deleteError) {
            throw new common_1.BadRequestException('Unable to cancel leave');
        }
        return { message: 'Leave cancelled successfully', balanceRestored: leave.leave_type === 'CASUAL' || leave.leave_type === 'SICK' };
    }
    async adminUpdateLeave(leaveId, dto) {
        const { data: existing, error: existingError } = await this.supabaseService.client
            .from('leaves')
            .select('id,user_id,leave_type,from_date,to_date,reason,status')
            .eq('id', leaveId)
            .maybeSingle();
        if (existingError || !existing) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        const newFrom = dto.fromDate ? this.normalizeDate(dto.fromDate) : existing.from_date;
        const newTo = dto.toDate ? this.normalizeDate(dto.toDate) : existing.to_date;
        if (newTo < newFrom) {
            throw new common_1.BadRequestException('To date must be after from date');
        }
        const oldDays = existing.status === 'APPROVED' ? this.countDays(existing.from_date, existing.to_date) : 0;
        const newStatus = dto.status ?? existing.status;
        const newDays = newStatus === 'APPROVED' ? this.countDays(newFrom, newTo) : 0;
        if (oldDays !== newDays) {
            await this.adjustLeaveBalance(existing.user_id, oldDays, newDays);
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
            throw new common_1.BadRequestException('Unable to update leave');
        }
        return updated;
    }
    async adminDeleteLeave(leaveId) {
        const { data: existing, error: existingError } = await this.supabaseService.client
            .from('leaves')
            .select('id,user_id,from_date,to_date,status')
            .eq('id', leaveId)
            .maybeSingle();
        if (existingError || !existing) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        if (existing.status === 'APPROVED') {
            const days = this.countDays(existing.from_date, existing.to_date);
            await this.adjustLeaveBalance(existing.user_id, days, 0);
        }
        const { error: deleteError } = await this.supabaseService.client
            .from('leaves')
            .delete()
            .eq('id', leaveId);
        if (deleteError) {
            throw new common_1.BadRequestException('Unable to delete leave');
        }
        return { message: 'Leave deleted' };
    }
    normalizeDate(value) {
        const date = new Date(value);
        const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        return utc.toISOString().slice(0, 10);
    }
    countDays(fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diff = to.getTime() - from.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }
    calculateDaysDifference(date1, date2) {
        const d1 = new Date(date1 + 'T00:00:00Z');
        const d2 = new Date(date2 + 'T00:00:00Z');
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    async adjustLeaveBalance(userId, oldDays, newDays) {
        const delta = newDays - oldDays;
        if (delta === 0) {
            return;
        }
        const { data: user, error: userError } = await this.supabaseService.client
            .from('users')
            .select('id,leave_balance')
            .eq('id', userId)
            .maybeSingle();
        if (userError || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        const newBalance = user.leave_balance - delta;
        if (newBalance < 0) {
            throw new common_1.BadRequestException('Insufficient leave balance');
        }
        const { error: updateError } = await this.supabaseService.client
            .from('users')
            .update({ leave_balance: newBalance })
            .eq('id', user.id);
        if (updateError) {
            throw new common_1.BadRequestException('Unable to update leave balance');
        }
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map