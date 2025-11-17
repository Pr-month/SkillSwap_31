import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './app.config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const config = configService.get<IConfig>('APP_CONFIG');
  
  if (!config) {
    throw new Error('APP_CONFIG not found');
  }

  if (config.database.url) {
    return {
      type: 'postgres',
      url: config.database.url,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: config.environment === 'development',
      logging: config.environment === 'development',
    };
  }
  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: config.environment === 'development',
    logging: config.environment === 'development',
  };
};