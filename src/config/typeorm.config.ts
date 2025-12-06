import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigType, registerAs } from '@nestjs/config';

export const dbConfig = registerAs('DB_CONFIG', (): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'skillswap',
    synchronize: !isProduction,
    logging: process.env.DB_LOGGING === 'true',
    autoLoadEntities: true,
  };
});

export type TDbConfig = ConfigType<typeof dbConfig>;
