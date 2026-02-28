import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';
import { AdminPasswordLoginDto } from './dto/admin-password-login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active')
      .eq('employee_id', dto.employeeId)
      .maybeSingle();
    if (error || !user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { data: authData, error: authError } =
      await this.supabaseService.authClient.auth.signInWithPassword({
        email: user.email,
        password: dto.password,
      });
    if (authError || !authData.session?.access_token || !authData.user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (authData.user.id !== user.id) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      accessToken: authData.session.access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        role: user.role,
        casualBalance: user.casual_balance,
        sickBalance: user.sick_balance,
        leaveBalance: user.casual_balance, // backward compat for UserDashboard
      },
    };
  }

  async adminSignup(dto: AdminSignupDto) {
    const setupToken = this.configService.get<string>('ADMIN_SETUP_TOKEN') ?? '';
    if (setupToken && dto.setupToken !== setupToken) {
      throw new UnauthorizedException('Invalid setup token');
    }
    const { count: adminCount, error: adminCountError } = await this.supabaseService.client
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'ADMIN');
    if (adminCountError) {
      throw new BadRequestException('Unable to verify admin count');
    }
    if ((adminCount ?? 0) > 0 && !setupToken) {
      throw new BadRequestException('Admin already exists');
    }
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
    const { data: employeeIdExists, error: employeeIdError } = await this.supabaseService.client
      .from('users')
      .select('id')
      .eq('employee_id', dto.employeeId)
      .maybeSingle();
    if (employeeIdError) {
      throw new BadRequestException('Unable to validate employee ID');
    }
    if (employeeIdExists) {
      throw new BadRequestException('Employee ID already in use');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { data: authUser, error: authError } =
      await this.supabaseService.client.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
        user_metadata: { role: 'ADMIN' },
      });
    if (authError || !authUser.user) {
      throw new BadRequestException('Unable to create admin credentials');
    }
    const { data: admin, error: createError } = await this.supabaseService.client
      .from('users')
      .insert({
        id: authUser.user.id,
        name: dto.name,
        email: dto.email,
        employee_id: dto.employeeId,
        password_hash: passwordHash,
        role: 'ADMIN',
        casual_balance: 12,
        sick_balance: 12,
        is_active: true,
      })
      .select('id,name,email,employee_id,role')
      .single();
    if (createError || !admin) {
      await this.supabaseService.client.auth.admin.deleteUser(authUser.user.id);
      throw new BadRequestException('Unable to create admin');
    }
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      employeeId: admin.employee_id,
      role: admin.role,
    };
  }

  async adminPasswordLogin(dto: AdminPasswordLoginDto) {
    const adminEmail = this.configService.get<string>('ADMIN_DASHBOARD_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_DASHBOARD_PASSWORD');

    if (!adminEmail) {
      throw new BadRequestException('ADMIN_DASHBOARD_EMAIL is not configured');
    }
    if (!adminPassword) {
      throw new BadRequestException('ADMIN_DASHBOARD_PASSWORD is not configured');
    }

    if (dto.password !== adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { data: adminUser, error: adminUserError } = await this.supabaseService.client
      .from('users')
      .select('id,name,email,employee_id,role,casual_balance,sick_balance,is_active')
      .eq('email', adminEmail)
      .maybeSingle();

    if (adminUserError || !adminUser || !adminUser.is_active || adminUser.role !== 'ADMIN') {
      throw new UnauthorizedException('Access denied');
    }

    let { data: authData, error: authError } =
      await this.supabaseService.authClient.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

    if (authError || !authData.session?.access_token || !authData.user) {
      const { error: syncError } = await this.supabaseService.client.auth.admin.updateUserById(
        adminUser.id,
        {
          password: adminPassword,
          email_confirm: true,
        },
      );

      if (syncError) {
        throw new UnauthorizedException('Invalid credentials');
      }

      ({ data: authData, error: authError } =
        await this.supabaseService.authClient.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        }));
    }

    if (authError || !authData.session?.access_token || !authData.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (authData.user.id !== adminUser.id) {
      throw new UnauthorizedException('Access denied');
    }

    return {
      accessToken: authData.session.access_token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        employeeId: adminUser.employee_id,
        role: adminUser.role,
        casualBalance: adminUser.casual_balance,
        sickBalance: adminUser.sick_balance,
        leaveBalance: adminUser.casual_balance,
      },
    };
  }
}
