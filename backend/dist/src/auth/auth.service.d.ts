import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';
export declare class AuthService {
    private supabaseService;
    private configService;
    constructor(supabaseService: SupabaseService, configService: ConfigService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: any;
            name: any;
            email: any;
            employeeId: any;
            role: any;
            leaveBalance: any;
        };
    }>;
    adminSignup(dto: AdminSignupDto): Promise<{
        id: any;
        name: any;
        email: any;
        employeeId: any;
        role: any;
    }>;
}
