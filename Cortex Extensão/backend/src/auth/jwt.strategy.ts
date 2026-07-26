import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtAuthPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        process.env.SUPABASE_JWT_SECRET ||
        'jwt_disabled',
    });
  }

  validate(payload: JwtAuthPayload) {
    return payload;
  }
}
