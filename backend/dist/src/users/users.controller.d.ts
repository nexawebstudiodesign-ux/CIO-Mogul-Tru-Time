import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
        createdAt: any;
    }>;
    list(): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
        createdAt: any;
    }[]>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
        createdAt: any;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    updateLeaveBalance(id: string, dto: UpdateLeaveBalanceDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
        leaveBalance: any;
        isActive: any;
    }>;
    resetPassword(id: string, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
