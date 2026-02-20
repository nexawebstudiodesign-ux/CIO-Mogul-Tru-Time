import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMonthlySalaryDto } from './dto/create-salary.dto';
import { UpdateMonthlySalaryDto } from './dto/update-salary.dto';

@Injectable()
export class SalaryService {
  constructor(private supabase: SupabaseService) {}

  private normalizeMonth(month: string) {
    if (!month) {
      throw new BadRequestException('Month is required');
    }

    if (/^\d{4}-\d{2}$/.test(month)) {
      return `${month}-01`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(month)) {
      return `${month.slice(0, 7)}-01`;
    }

    throw new BadRequestException('Month must be in YYYY-MM format');
  }

  async create(createSalaryDto: CreateMonthlySalaryDto) {
    if (!createSalaryDto.userId) {
      throw new BadRequestException('User is required');
    }

    const normalizedMonth = this.normalizeMonth(createSalaryDto.month);

    // Validation 1: Check for duplicate salary record for same user/month
    const { data: existing, error: checkError } = await this.supabase.client
      .from('monthly_salaries')
      .select('id,month')
      .eq('user_id', createSalaryDto.userId)
      .eq('month', normalizedMonth)
      .maybeSingle();

    if (checkError) {
      throw new BadRequestException('Unable to validate salary record');
    }

    if (existing) {
      throw new BadRequestException(
        `Salary record already exists for this user in ${createSalaryDto.month}. Please edit the existing record instead of creating a duplicate.`
      );
    }

    const { data, error } = await this.supabase.client
      .from('monthly_salaries')
      .insert({
        user_id: createSalaryDto.userId,
        month: normalizedMonth,
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

    if (error) throw error;
    return this.mapToDto(data);
  }

  async findAll(month?: string, userId?: string) {
    let query = this.supabase.client.from('monthly_salaries').select('*');

    if (month) {
      query = query.eq('month', this.normalizeMonth(month));
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map((record) => this.mapToDto(record));
  }

  async findMine(userId: string, month?: string) {
    if (!userId) {
      throw new BadRequestException('User is required');
    }

    return this.findAll(month, userId);
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('monthly_salaries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.mapToDto(data);
  }

  async update(id: string, updateSalaryDto: UpdateMonthlySalaryDto) {
    const updateData: any = {};
    
    if (updateSalaryDto.baseSalary !== undefined) updateData.base_salary = updateSalaryDto.baseSalary;
    if (updateSalaryDto.hra !== undefined) updateData.hra = updateSalaryDto.hra;
    if (updateSalaryDto.transportAllowance !== undefined) updateData.transport_allowance = updateSalaryDto.transportAllowance;
    if (updateSalaryDto.otherAllowance !== undefined) updateData.other_allowance = updateSalaryDto.otherAllowance;
    if (updateSalaryDto.performanceBonus !== undefined) updateData.performance_bonus = updateSalaryDto.performanceBonus;
    if (updateSalaryDto.pfDeduction !== undefined) updateData.pf_deduction = updateSalaryDto.pfDeduction;
    if (updateSalaryDto.taxDeduction !== undefined) updateData.tax_deduction = updateSalaryDto.taxDeduction;
    if (updateSalaryDto.otherDeduction !== undefined) updateData.other_deduction = updateSalaryDto.otherDeduction;

    const { data, error } = await this.supabase.client
      .from('monthly_salaries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToDto(data);
  }

  async remove(id: string) {
    const { error } = await this.supabase.client
      .from('monthly_salaries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Salary record deleted successfully' };
  }

  private mapToDto(data: any) {
    return {
      id: data.id,
      userId: data.user_id,
      month: typeof data.month === 'string' ? data.month.slice(0, 7) : data.month,
      workingDays: data.working_days ?? data.workingDays ?? null,
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
}
