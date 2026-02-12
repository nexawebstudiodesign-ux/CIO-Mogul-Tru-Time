import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../common/roles.enum';
import { SupabaseService } from '../supabase/supabase.service';

export type JwtPayload = {
  sub: string;
  role?: Role | string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const { data: user } = await this.supabaseService.client
      .from('users')
      .select('id,role')
      .eq('id', payload.sub)
      .maybeSingle();
    return { id: payload.sub, role: user?.role };
  }
}
