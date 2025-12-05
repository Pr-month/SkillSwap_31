import { ConfigType, registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'accessSecretKey',
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '1h') as StringValue,
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refreshSecretKey',
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue,
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
