import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: 'supabase_disabled',
        algorithms: ['HS256'],
      });
      return;
    }

    const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUri,
      }),
      algorithms: ['HS256', 'ES256'],
    });
  }

  async validate(payload: any) {
    console.log('JWT validado com sucesso via JWKS para o usuário:', payload.email);
    // O payload do Supabase contém o 'sub' (User ID), 'email' e 'user_metadata'
    return { 
      id: payload.sub, 
      email: payload.email,
      name: payload.user_metadata?.full_name || payload.user_metadata?.name,
      avatarUrl: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
    };
  }
}
