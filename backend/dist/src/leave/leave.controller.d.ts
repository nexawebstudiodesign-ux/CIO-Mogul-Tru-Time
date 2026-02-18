import { LeaveService } from './leave.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { AdminCreateLeaveDto } from './dto/admin-create-leave.dto';
import { AdminUpdateLeaveDto } from './dto/admin-update-leave.dto';
export declare class LeaveController {
    private leaveService;
    constructor(leaveService: LeaveService);
    apply(req: {
        user?: {
            id?: string;
        };
    }, dto: ApplyLeaveDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }>;
    listMine(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }[]>;
    cancelLeave(req: {
        user?: {
            id?: string;
        };
    }, id: string): Promise<{
        message: string;
        balanceRestored: boolean;
    }>;
    listAll(status?: string): Promise<{
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
    adminCreate(dto: AdminCreateLeaveDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }>;
    adminUpdate(id: string, dto: AdminUpdateLeaveDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
        created_at: any;
    }>;
    adminDelete(id: string): Promise<{
        message: string;
    }>;
    updateStatus(id: string, dto: UpdateLeaveStatusDto): Promise<{
        id: any;
        user_id: any;
        leave_type: any;
        from_date: any;
        to_date: any;
        reason: any;
        status: any;
    }>;
}
