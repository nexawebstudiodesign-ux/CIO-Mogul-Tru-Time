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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AttendanceService = class AttendanceService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createAttendance(userId, dto) {
        const date = this.normalizeDate(dto.date);
        const loginTime = new Date(dto.loginTime);
        const logoutTime = new Date(dto.logoutTime);
        if (logoutTime <= loginTime) {
            throw new common_1.BadRequestException('Logout must be after login');
        }
        const { data: existing, error: existingError } = await this.supabaseService.client
            .from('attendance')
            .select('id')
            .eq('user_id', userId)
            .eq('date', date)
            .maybeSingle();
        if (existingError) {
            throw new common_1.BadRequestException('Unable to validate attendance');
        }
        if (existing) {
            throw new common_1.BadRequestException('Attendance already submitted for this date');
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
            throw new common_1.BadRequestException('Unable to create attendance');
        }
        return attendance;
    }
    async listAttendance(query) {
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
            throw new common_1.BadRequestException('Unable to load attendance records');
        }
        return data ?? [];
    }
    async listMyAttendance(userId) {
        const { data, error } = await this.supabaseService.client
            .from('attendance')
            .select('id,user_id,date,login_time,logout_time,total_minutes,mails_count,data_count,linkedin_count,follow_up_count,created_at')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException('Unable to load attendance records');
        }
        return data ?? [];
    }
    normalizeDate(value) {
        const date = new Date(value);
        const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        return utc.toISOString().slice(0, 10);
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map