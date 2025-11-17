import { ConfigType, registerAs } from '@nestjs/config';

export const configuration = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  database: {
    driver: process.env.DATABASE_DRIVER || 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
}));

export type IConfig = ConfigType<typeof configuration>;
