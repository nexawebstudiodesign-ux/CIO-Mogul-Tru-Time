import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    readonly client: SupabaseClient;
    readonly authClient: SupabaseClient;
    constructor(configService: ConfigService);
}
