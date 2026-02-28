import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private static readonly MAX_LEAVE_BALANCE = 12;

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
    const { data: authUser, error: authError } =
      await this.supabaseService.client.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
        user_metadata: { role: 'USER' },
      });
    if (authError || !authUser.user) {
      throw new BadRequestException('Unable to create user credentials');
    }
    const casualBalance = dto.casualBalance ?? dto.leaveBalance ?? 12;
    const sickBalance = dto.sickBalance ?? dto.leaveBalance ?? 12;
    const { data: user, error: createError } = await this.supabaseService.client
      .from('users')
      .insert({
        id: authUser.user.id,
        name: dto.name,
        email: dto.email,
        employee_id: employeeId,
        password_hash: passwordHash,
        admin_password: dto.password,
        role: 'USER',
        casual_balance: casualBalance,
        sick_balance: sickBalance,
        is_active: true,
      })
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,admin_password,is_active,created_at')
      .single();
    if (createError || !user) {
      await this.supabaseService.client.auth.admin.deleteUser(authUser.user.id);
      throw new BadRequestException('Unable to create user');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employee_id,
      role: user.role,
      casualBalance: user.casual_balance,
      sickBalance: user.sick_balance,
      adminPassword: user.admin_password,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  async listUsers() {
    await this.applyMonthlyAccrualForAllUsers();

    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,admin_password,is_active,created_at')
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
      casualBalance: user.casual_balance,
      sickBalance: user.sick_balance,
      adminPassword: user.admin_password,
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
      const { error: authUpdateError } =
        await this.supabaseService.client.auth.admin.updateUserById(userId, {
          email: dto.email,
        });
      if (authUpdateError) {
        throw new BadRequestException('Unable to update auth email');
      }
    }
    const updatePayload: Record<string, unknown> = {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      is_active: dto.isActive ?? user.is_active,
    };
    if (dto.casualBalance !== undefined) updatePayload.casual_balance = dto.casualBalance;
    if (dto.sickBalance !== undefined) updatePayload.sick_balance = dto.sickBalance;
    if (dto.bankName !== undefined) updatePayload.bank_name = dto.bankName;
    if (dto.accountNumber !== undefined) updatePayload.account_number = dto.accountNumber;
    if (dto.ifscCode !== undefined) updatePayload.ifsc_code = dto.ifscCode;
    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,bank_name,account_number,ifsc_code,admin_password,is_active,created_at')
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
      casualBalance: updated.casual_balance,
      sickBalance: updated.sick_balance,
      bankName: updated.bank_name,
      accountNumber: updated.account_number,
      ifscCode: updated.ifsc_code,
      adminPassword: updated.admin_password,
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
    const updatePayload: Record<string, number> = {};
    if (dto.casualBalance !== undefined) updatePayload.casual_balance = dto.casualBalance;
    if (dto.sickBalance !== undefined) updatePayload.sick_balance = dto.sickBalance;
    if (dto.leaveBalance !== undefined && Object.keys(updatePayload).length === 0) {
      updatePayload.casual_balance = dto.leaveBalance;
      updatePayload.sick_balance = dto.leaveBalance;
    }
    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('Provide at least casualBalance, sickBalance, or leaveBalance');
    }
    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active')
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
      casualBalance: updated.casual_balance,
      sickBalance: updated.sick_balance,
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
    const { error: authUpdateError } =
      await this.supabaseService.client.auth.admin.updateUserById(userId, {
        password: dto.password,
      });
    if (authUpdateError) {
      throw new BadRequestException('Unable to reset auth password');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { error: updateError } = await this.supabaseService.client
      .from('users')
      .update({ password_hash: passwordHash, admin_password: dto.password })
      .eq('id', userId);
    if (updateError) {
      throw new BadRequestException('Unable to reset password');
    }
    return { message: 'Password updated' };
  }

  async deleteUser(userId: string) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active,created_at')
      .eq('id', userId)
      .maybeSingle();
    if (userError || !user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_active === false) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        role: user.role,
        casualBalance: user.casual_balance,
        sickBalance: user.sick_balance,
        isActive: false,
        createdAt: user.created_at,
      };
    }

    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active,created_at')
      .single();

    if (updateError || !updated) {
      throw new BadRequestException('Unable to move user to recycle bin');
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      employeeId: updated.employee_id,
      role: updated.role,
      casualBalance: updated.casual_balance,
      sickBalance: updated.sick_balance,
      isActive: updated.is_active,
      createdAt: updated.created_at,
    };
  }

  async restoreUser(userId: string) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active,created_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_active === true) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        role: user.role,
        casualBalance: user.casual_balance,
        sickBalance: user.sick_balance,
        isActive: true,
        createdAt: user.created_at,
      };
    }

    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active,created_at')
      .single();

    if (updateError || !updated) {
      throw new BadRequestException('Unable to restore user');
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      employeeId: updated.employee_id,
      role: updated.role,
      casualBalance: updated.casual_balance,
      sickBalance: updated.sick_balance,
      isActive: updated.is_active,
      createdAt: updated.created_at,
    };
  }

  async permanentlyDeleteUser(userId: string) {
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,is_active')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_active !== false) {
      throw new BadRequestException('Move user to recycle bin before permanent delete');
    }

    const { error: deleteDbError } = await this.supabaseService.client
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteDbError) {
      throw new BadRequestException('Unable to permanently delete user');
    }

    const { error: deleteAuthError } = await this.supabaseService.client.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.warn('Deleted user row but failed to delete auth user', {
        userId,
        error: deleteAuthError.message,
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employee_id,
      message: 'User permanently deleted',
    };
  }

  async getMe(userId: string) {
    await this.applyMonthlyAccrualForUser(userId);

    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,bank_name,account_number,ifsc_code,is_active')
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
      casualBalance: user.casual_balance,
      sickBalance: user.sick_balance,
      leaveBalance: user.casual_balance,
      bankName: user.bank_name,
      accountNumber: user.account_number,
      ifscCode: user.ifsc_code,
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
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  }

  private getCurrentAccrualMonth() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private async applyMonthlyAccrualForAllUsers() {
    const { data: users, error } = await this.supabaseService.client
      .from('users')
      .select('id,casual_balance,sick_balance,last_leave_accrual_month');

    if (error) {
      if (String(error.message ?? '').includes('last_leave_accrual_month')) {
        return;
      }
      throw new BadRequestException('Unable to process monthly leave accrual');
    }

    const month = this.getCurrentAccrualMonth();
    for (const user of users ?? []) {
      if ((user as { last_leave_accrual_month?: string }).last_leave_accrual_month === month) {
        continue;
      }

      const casualBalance = Math.min(
        Number((user as { casual_balance?: number }).casual_balance ?? 0) + 1,
        UsersService.MAX_LEAVE_BALANCE,
      );
      const sickBalance = Math.min(
        Number((user as { sick_balance?: number }).sick_balance ?? 0) + 1,
        UsersService.MAX_LEAVE_BALANCE,
      );

      const { error: updateError } = await this.supabaseService.client
        .from('users')
        .update({
          casual_balance: casualBalance,
          sick_balance: sickBalance,
          last_leave_accrual_month: month,
        })
        .eq('id', (user as { id: string }).id);

      if (updateError) {
        throw new BadRequestException('Unable to process monthly leave accrual');
      }
    }
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
      UsersService.MAX_LEAVE_BALANCE,
    );
    const sickBalance = Math.min(
      Number((user as { sick_balance?: number }).sick_balance ?? 0) + 1,
      UsersService.MAX_LEAVE_BALANCE,
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
