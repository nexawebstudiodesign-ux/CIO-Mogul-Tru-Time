import { SupabaseService } from '../supabase/supabase.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { AdminCreateLeaveDto } from './dto/admin-create-leave.dto';
import { AdminUpdateLeaveDto } from './dto/admin-update-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
export declare class LeaveService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    adminCreateLeave(dto: AdminCreateLeaveDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }>;
    applyLeave(userId: string, dto: ApplyLeaveDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }>;
    listMyLeaves(userId: string): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }[]>;
    listAllLeaves(status?: string): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
        users: {
            id: any;
            name: any;
            employee_id: any;
            leave_balance: any;
        }[];
    }[]>;
    updateStatus(leaveId: string, dto: UpdateLeaveStatusDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
    }>;
    cancelLeave(userId: string, leaveId: string): Promise<{
        message: string;
        balanceRestored: boolean;
    }>;
    adminUpdateLeave(leaveId: string, dto: AdminUpdateLeaveDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }>;
    adminDeleteLeave(leaveId: string): Promise<{
        message: string;
    }>;
    private normalizeDate;
    private countDays;
    private calculateDaysDifference;
    private adjustLeaveBalance;
}
