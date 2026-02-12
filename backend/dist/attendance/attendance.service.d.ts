import { SupabaseService } from '../supabase/supabase.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
export declare class AttendanceService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    createAttendance(userId: string, dto: CreateAttendanceDto): Promise<{
        id: any;
        user_id: any;
        date: any;
        login_time: any;
        logout_time: any;
        total_minutes: any;
        mails_count: any;
        data_count: any;
        linkedin_count: any;
        follow_up_count: any;
        created_at: any;
        users: {
            id: any;
            name: any;
            employee_id: any;
        }[];
    }>;
    listAttendance(query: QueryAttendanceDto): Promise<{
        id: any;
        user_id: any;
        date: any;
        login_time: any;
        logout_time: any;
        total_minutes: any;
        mails_count: any;
        data_count: any;
        linkedin_count: any;
        follow_up_count: any;
        created_at: any;
        users: {
            id: any;
            name: any;
            employee_id: any;
        }[];
    }[]>;
    listMyAttendance(userId: string): Promise<{
        id: any;
        user_id: any;
        date: any;
        login_time: any;
        logout_time: any;
        total_minutes: any;
        mails_count: any;
        data_count: any;
        linkedin_count: any;
        follow_up_count: any;
        created_at: any;
    }[]>;
    private normalizeDate;
}
