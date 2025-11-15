import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: 'refresh_secret',
      passReqToCallback: true,
    });
  }

  validate<T extends { body: { refreshToken: string } }>(
    req: T,
    payload: { name: string; email: string },
  ) {
    return {
      ...payload,
      refreshToken: req.body.refreshToken,
    };
  }
}
