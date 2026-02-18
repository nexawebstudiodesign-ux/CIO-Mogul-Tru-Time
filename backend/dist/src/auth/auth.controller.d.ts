import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
