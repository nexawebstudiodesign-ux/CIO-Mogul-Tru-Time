"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createUser(dto) {
        const { data: emailExists, error: emailError } = await this.supabaseService.client
            .from('users')
            .select('id')
            .eq('email', dto.email)
            .maybeSingle();
        if (emailError) {
            throw new common_1.BadRequestException('Unable to validate email');
        }
        if (emailExists) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const employeeId = await this.generateEmployeeId();
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const { data: authUser, error: authError } = await this.supabaseService.client.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
            user_metadata: { role: 'USER' },
        });
        if (authError || !authUser.user) {
            throw new common_1.BadRequestException('Unable to create user credentials');
        }
        const { data: user, error: createError } = await this.supabaseService.client
            .from('users')
            .insert({
            id: authUser.user.id,
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
            await this.supabaseService.client.auth.admin.deleteUser(authUser.user.id);
            throw new common_1.BadRequestException('Unable to create user');
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
            throw new common_1.BadRequestException('Unable to load users');
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
    async updateUser(userId, dto) {
        const { data: user, error: userError } = await this.supabaseService.client
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (userError || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== user.email) {
            const { data: emailExists, error: emailError } = await this.supabaseService.client
                .from('users')
                .select('id')
                .eq('email', dto.email)
                .maybeSingle();
            if (emailError) {
                throw new common_1.BadRequestException('Unable to validate email');
            }
            if (emailExists) {
                throw new common_1.BadRequestException('Email already in use');
            }
            const { error: authUpdateError } = await this.supabaseService.client.auth.admin.updateUserById(userId, {
                email: dto.email,
            });
            if (authUpdateError) {
                throw new common_1.BadRequestException('Unable to update auth email');
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
            throw new common_1.BadRequestException('Unable to update user');
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
    async updateLeaveBalance(userId, dto) {
        const { data: user, error: userError } = await this.supabaseService.client
            .from('users')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
        if (userError || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { data: updated, error: updateError } = await this.supabaseService.client
            .from('users')
            .update({ leave_balance: dto.leaveBalance })
            .eq('id', userId)
            .select('id,name,email,employee_id,role,leave_balance,is_active')
            .single();
        if (updateError || !updated) {
            throw new common_1.BadRequestException('Unable to update leave balance');
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
    async resetPassword(userId, dto) {
        const { data: user, error: userError } = await this.supabaseService.client
            .from('users')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
        if (userError || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { error: authUpdateError } = await this.supabaseService.client.auth.admin.updateUserById(userId, {
            password: dto.password,
        });
        if (authUpdateError) {
            throw new common_1.BadRequestException('Unable to reset auth password');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const { error: updateError } = await this.supabaseService.client
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', userId);
        if (updateError) {
            throw new common_1.BadRequestException('Unable to reset password');
        }
        return { message: 'Password updated' };
    }
    async deleteUser(userId) {
        const { data: user, error: userError } = await this.supabaseService.client
            .from('users')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
        if (userError || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { error: authDeleteError } = await this.supabaseService.client.auth.admin.deleteUser(userId);
        if (authDeleteError) {
            throw new common_1.BadRequestException('Unable to delete auth user');
        }
        const { error: deleteError } = await this.supabaseService.client.from('users').delete().eq('id', userId);
        if (deleteError) {
            throw new common_1.BadRequestException('Unable to delete user');
        }
        return { message: 'User deleted' };
    }
    async getMe(userId) {
        const { data: user, error } = await this.supabaseService.client
            .from('users')
            .select('id,name,email,employee_id,role,leave_balance,is_active')
            .eq('id', userId)
            .maybeSingle();
        if (error || !user) {
            throw new common_1.NotFoundException('User not found');
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
    async generateEmployeeId() {
        const prefix = 'CIO-';
        const { data: users, error } = await this.supabaseService.client
            .from('users')
            .select('employee_id');
        if (error) {
            throw new common_1.BadRequestException('Unable to generate employee ID');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map