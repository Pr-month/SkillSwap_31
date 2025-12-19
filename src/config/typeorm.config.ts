import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigType, registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

// Базовый конфиг (без NestJS-специфичных опций)
const baseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database:
    process.env.NODE_ENV === 'test'
      ? process.env.DB_TEST_NAME || 'skillswap_test'
      : process.env.DB_NAME || 'skillswap',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
};

// Для NestJS
export const dbConfig = registerAs(
  'DB_CONFIG',
  (): TypeOrmModuleOptions => ({
    ...baseConfig,
    autoLoadEntities: true,
  }),
);

// Для DataSource
export const dataSourceConfig: DataSourceOptions = {
  ...baseConfig,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  subscribers: ['dist/subscribers/*{.ts,.js}'],
};

export const AppDataSource = new DataSource(dataSourceConfig);

export type TDbConfig = ConfigType<typeof dbConfig>;
