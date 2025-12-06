import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigType, registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Базовый конфиг (без NestJS-специфичных опций)
const baseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'skillswap',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
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
