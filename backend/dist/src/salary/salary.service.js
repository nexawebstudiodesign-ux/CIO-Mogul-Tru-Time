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
exports.SalaryService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let SalaryService = class SalaryService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(createSalaryDto) {
        const { data: existing, error: checkError } = await this.supabase.client
            .from('monthly_salaries')
            .select('id,month')
            .eq('user_id', createSalaryDto.userId)
            .eq('month', createSalaryDto.month)
            .maybeSingle();
        if (checkError) {
            throw new common_1.BadRequestException('Unable to validate salary record');
        }
        if (existing) {
            throw new common_1.BadRequestException(`Salary record already exists for this user in ${createSalaryDto.month}. Please edit the existing record instead of creating a duplicate.`);
        }
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const [year, month] = createSalaryDto.month.split('-').map(Number);
        const monthsDiff = (year - currentYear) * 12 + (month - currentMonth);
        if (monthsDiff > 1) {
            const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
            const nextMonthDate = new Date(currentYear, currentMonth, 1);
            const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
            throw new common_1.BadRequestException(`You can only create salary records for the current month (${currentMonthStr}) or next month (${nextMonthStr}). Cannot create for ${createSalaryDto.month}.`);
        }
        if (monthsDiff < -12) {
            throw new common_1.BadRequestException('Cannot create salary records for months older than 12 months');
        }
        const { data, error } = await this.supabase.client
            .from('monthly_salaries')
            .insert({
            user_id: createSalaryDto.userId,
            month: createSalaryDto.month,
            working_days: createSalaryDto.workingDays || 0,
            base_salary: createSalaryDto.baseSalary || 0,
            hra: createSalaryDto.hra || 0,
            transport_allowance: createSalaryDto.transportAllowance || 0,
            other_allowance: createSalaryDto.otherAllowance || 0,
            performance_bonus: createSalaryDto.performanceBonus || 0,
            pf_deduction: createSalaryDto.pfDeduction || 0,
            tax_deduction: createSalaryDto.taxDeduction || 0,
            other_deduction: createSalaryDto.otherDeduction || 0,
        })
            .select()
            .single();
        if (error)
            throw error;
        return this.mapToDto(data);
    }
    async findAll(month, userId) {
        let query = this.supabase.client.from('monthly_salaries').select('*');
        if (month) {
            query = query.eq('month', month);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data.map((record) => this.mapToDto(record));
    }
    async findOne(id) {
        const { data, error } = await this.supabase.client
            .from('monthly_salaries')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return this.mapToDto(data);
    }
    async update(id, updateSalaryDto) {
        const updateData = {};
        if (updateSalaryDto.workingDays !== undefined)
            updateData.working_days = updateSalaryDto.workingDays;
        if (updateSalaryDto.baseSalary !== undefined)
            updateData.base_salary = updateSalaryDto.baseSalary;
        if (updateSalaryDto.hra !== undefined)
            updateData.hra = updateSalaryDto.hra;
        if (updateSalaryDto.transportAllowance !== undefined)
            updateData.transport_allowance = updateSalaryDto.transportAllowance;
        if (updateSalaryDto.otherAllowance !== undefined)
            updateData.other_allowance = updateSalaryDto.otherAllowance;
        if (updateSalaryDto.performanceBonus !== undefined)
            updateData.performance_bonus = updateSalaryDto.performanceBonus;
        if (updateSalaryDto.pfDeduction !== undefined)
            updateData.pf_deduction = updateSalaryDto.pfDeduction;
        if (updateSalaryDto.taxDeduction !== undefined)
            updateData.tax_deduction = updateSalaryDto.taxDeduction;
        if (updateSalaryDto.otherDeduction !== undefined)
            updateData.other_deduction = updateSalaryDto.otherDeduction;
        const { data, error } = await this.supabase.client
            .from('monthly_salaries')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return this.mapToDto(data);
    }
    async remove(id) {
        const { error } = await this.supabase.client
            .from('monthly_salaries')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Salary record deleted successfully' };
    }
    mapToDto(data) {
        return {
            id: data.id,
            userId: data.user_id,
            month: data.month,
            workingDays: data.working_days,
            baseSalary: data.base_salary,
            hra: data.hra,
            transportAllowance: data.transport_allowance,
            otherAllowance: data.other_allowance,
            performanceBonus: data.performance_bonus,
            pfDeduction: data.pf_deduction,
            taxDeduction: data.tax_deduction,
            otherDeduction: data.other_deduction,
            createdAt: data.created_at,
        };
    }
};
exports.SalaryService = SalaryService;
exports.SalaryService = SalaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SalaryService);
//# sourceMappingURL=salary.service.js.map