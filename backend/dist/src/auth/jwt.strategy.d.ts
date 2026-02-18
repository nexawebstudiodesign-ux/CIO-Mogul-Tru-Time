import { ConfigService } from '@nestjs/config';
import { Role } from '../common/roles.enum';
import { SupabaseService } from '../supabase/supabase.service';
export type JwtPayload = {
    sub: string;
    role?: Role | string;
};
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private supabaseService;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        role: any;
    }>;
}
export {};
