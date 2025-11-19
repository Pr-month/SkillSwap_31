import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { configuration } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { Test } from './test.entity'
import { dbConfig, TDbConfig } from './config/typeorm.config';
import { SkillsModule } from './skills/skills.module';
import { createWinstonLogger } from './config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, jwtConfig, dbConfig],
    }),
    WinstonModule.forRoot({
      instance: createWinstonLogger(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (dbConfig: TDbConfig) => dbConfig,
      inject: [dbConfig.KEY],
    }),
    TypeOrmModule.forFeature([Test]),
    UsersModule,
    AuthModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
