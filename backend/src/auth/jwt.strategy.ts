// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Role } from '../common/roles.enum';
// import { SupabaseService } from '../supabase/supabase.service';

// export type JwtPayload = {
//   sub: string;
//   role?: Role | string;
// };

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     configService: ConfigService,
//     private supabaseService: SupabaseService,
//   ) {
//     const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
//     if (!jwtSecret) {
//       throw new Error('SUPABASE_JWT_SECRET is not defined in environment variables');
//     }
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: jwtSecret,
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const { data: user } = await this.supabaseService.client
//       .from('users')
//       .select('id,role')
//       .eq('id', payload.sub)
//       .maybeSingle();
//     return { id: payload.sub, role: user?.role };
//   }
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { Role } from '../common/roles.enum';
import { SupabaseService } from '../supabase/supabase.service';

export type JwtPayload = {
  sub: string;
  role?: Role | string;
  email?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const projectRef = configService.get<string>('SUPABASE_PROJECT_REF');

    if (!projectRef) {
      throw new Error('SUPABASE_PROJECT_REF is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: `https://${projectRef}.supabase.co/auth/v1`,
      algorithms: ['ES256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `https://${projectRef}.supabase.co/auth/v1/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: JwtPayload) {
    const { data: user } = await this.supabaseService.client
      .from('users')
      .select('id, role')
      .eq('id', payload.sub)
      .maybeSingle();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      role: String(user.role ?? '').toUpperCase(),
    };
  }
}
