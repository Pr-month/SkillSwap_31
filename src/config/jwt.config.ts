import { JwtSignOptions } from '@nestjs/jwt';
import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'accessSecretKey',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refreshSecretKey',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

export type TJwtConfig = {
  accessSecret: JwtSignOptions['secret'];
  accessExpiresIn: JwtSignOptions['expiresIn'];
  refreshSecret: JwtSignOptions['secret'];
  refreshExpiresIn: JwtSignOptions['expiresIn'];
};
