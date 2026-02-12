import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    create(req: {
        user?: {
            id?: string;
        };
    }, dto: CreateAttendanceDto): Promise<{
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
    list(query: QueryAttendanceDto): Promise<{
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
    listMine(req: {
        user?: {
            id?: string;
        };
    }): Promise<{
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
}
