import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async createUser(dto: CreateUserDto) {
    const { data: emailExists, error: emailError } = await this.supabaseService.client
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle();
    if (emailError) {
      throw new BadRequestException('Unable to validate email');
    }
    if (emailExists) {
      throw new BadRequestException('Email already in use');
    }
    const employeeId = await this.generateEmployeeId();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { data: user, error: createError } = await this.supabaseService.client
      .from('users')
      .insert({
        name: dto.name,
        email: dto.email,
        employee_id: employeeId,
        password_hash: passwordHash,
        role: 'USER',
        leave_balance: dto.leaveBalance ?? 0,
        is_active: true,
      })
      .select('id,name,email,employee_id,role,leave_balance,is_active,created_at')
      .single();
    if (createError || !user) {
      throw new BadRequestException('Unable to create user');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employee_id,
      role: user.role,
      leaveBalance: user.leave_balance,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  async listUsers() {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,leave_balance,is_active,created_at')
      .order('created_at', { ascending: false });
    if (error) {
      throw new BadRequestException('Unable to load users');
    }
    return (data ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employee_id,
      role: user.role,
      leaveBalance: user.leave_balance,
      isActive: user.is_active,
      createdAt: user.created_at,
    }));
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !user) {
      throw new NotFoundException('User not found');
    }
    if (dto.email && dto.email !== user.email) {
      const { data: emailExists, error: emailError } = await this.supabaseService.client
        .from('users')
        .select('id')
        .eq('email', dto.email)
        .maybeSingle();
      if (emailError) {
        throw new BadRequestException('Unable to validate email');
      }
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }
    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('users')
      .update({
        name: dto.name ?? user.name,
        email: dto.email ?? user.email,
        is_active: dto.isActive ?? user.is_active,
      })
      .eq('id', userId)
      .select('id,name,email,employee_id,role,leave_balance,is_active,created_at')
      .single();
    if (updateError || !updated) {
      throw new BadRequestException('Unable to update user');
    }
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      employeeId: updated.employee_id,
      role: updated.role,
      leaveBalance: updated.leave_balance,
      isActive: updated.is_active,
      createdAt: updated.created_at,
    };
  }

  async updateLeaveBalance(userId: string, dto: UpdateLeaveBalanceDto) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !user) {
      throw new NotFoundException('User not found');
    }
    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('users')
      .update({ leave_balance: dto.leaveBalance })
      .eq('id', userId)
      .select('id,name,email,employee_id,role,leave_balance,is_active')
      .single();
    if (updateError || !updated) {
      throw new BadRequestException('Unable to update leave balance');
    }
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      employeeId: updated.employee_id,
      role: updated.role,
      leaveBalance: updated.leave_balance,
      isActive: updated.is_active,
    };
  }

  async resetPassword(userId: string, dto: ResetPasswordDto) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !user) {
      throw new NotFoundException('User not found');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { error: updateError } = await this.supabaseService.client
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);
    if (updateError) {
      throw new BadRequestException('Unable to reset password');
    }
    return { message: 'Password updated' };
  }

  async deleteUser(userId: string) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !user) {
      throw new NotFoundException('User not found');
    }
    const { error: deleteError } = await this.supabaseService.client.from('users').delete().eq('id', userId);
    if (deleteError) {
      throw new BadRequestException('Unable to delete user');
    }
    return { message: 'User deleted' };
  }

  async getMe(userId: string) {
    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,leave_balance,is_active')
      .eq('id', userId)
      .maybeSingle();
    if (error || !user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employee_id,
      role: user.role,
      leaveBalance: user.leave_balance,
      isActive: user.is_active,
    };
  }

  private async generateEmployeeId() {
    const prefix = 'CIO-';
    const { data: users, error } = await this.supabaseService.client
      .from('users')
      .select('employee_id');
    if (error) {
      throw new BadRequestException('Unable to generate employee ID');
    }
    let max = 0;
    for (const user of users ?? []) {
      const match = (user.employee_id ?? '').match(/CIO-(\d+)/);
      if (match) {
        max = Math.max(max, Number(match[1]));
      }
    }
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }
}
