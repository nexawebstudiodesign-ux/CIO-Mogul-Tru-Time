import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class UsersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    createUser(dto: CreateUserDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
        createdAt: any;
    }>;
    listUsers(): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
        createdAt: any;
    }[]>;
    updateUser(userId: string, dto: UpdateUserDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
        createdAt: any;
    }>;
    updateLeaveBalance(userId: string, dto: UpdateLeaveBalanceDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
    }>;
    resetPassword(userId: string, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
    }>;
    private generateEmployeeId;
}
