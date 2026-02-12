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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../supabase/supabase.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    supabaseService;
    configService;
    constructor(supabaseService, configService) {
        this.supabaseService = supabaseService;
        this.configService = configService;
    }
    async login(dto) {
        const { data: user, error } = await this.supabaseService.client
            .from('users')
            .select('*')
            .eq('employee_id', dto.employeeId)
            .maybeSingle();
        if (error || !user || !user.is_active) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { data: authData, error: authError } = await this.supabaseService.authClient.auth.signInWithPassword({
            email: user.email,
            password: dto.password,
        });
        if (authError || !authData.session?.access_token || !authData.user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (authData.user.id !== user.id) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return {
            accessToken: authData.session.access_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                employeeId: user.employee_id,
                role: user.role,
                leaveBalance: user.leave_balance,
            },
        };
    }
    async adminSignup(dto) {
        const setupToken = this.configService.get('ADMIN_SETUP_TOKEN') ?? '';
        if (setupToken && dto.setupToken !== setupToken) {
            throw new common_1.UnauthorizedException('Invalid setup token');
        }
        const { count: adminCount, error: adminCountError } = await this.supabaseService.client
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'ADMIN');
        if (adminCountError) {
            throw new common_1.BadRequestException('Unable to verify admin count');
        }
        if ((adminCount ?? 0) > 0 && !setupToken) {
            throw new common_1.BadRequestException('Admin already exists');
        }
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
        const { data: employeeIdExists, error: employeeIdError } = await this.supabaseService.client
            .from('users')
            .select('id')
            .eq('employee_id', dto.employeeId)
            .maybeSingle();
        if (employeeIdError) {
            throw new common_1.BadRequestException('Unable to validate employee ID');
        }
        if (employeeIdExists) {
            throw new common_1.BadRequestException('Employee ID already in use');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const { data: authUser, error: authError } = await this.supabaseService.client.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
            user_metadata: { role: 'ADMIN' },
        });
        if (authError || !authUser.user) {
            throw new common_1.BadRequestException('Unable to create admin credentials');
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
            leave_balance: 0,
            is_active: true,
        })
            .select('id,name,email,employee_id,role')
            .single();
        if (createError || !admin) {
            await this.supabaseService.client.auth.admin.deleteUser(authUser.user.id);
            throw new common_1.BadRequestException('Unable to create admin');
        }
        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            employeeId: admin.employee_id,
            role: admin.role,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map