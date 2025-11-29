import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { Test } from './test.entity';
import { createWinstonLogger } from './config/logger.config';
import { dbConfig, TDbConfig } from './config/typeorm.config';
import { jwtConfig, TJwtConfig } from './config/jwt.config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { SkillsModule } from './skills/skills.module';
import { Test } from './test.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, jwtConfig, dbConfig],
    }),
    WinstonModule.forRoot({
      instance: createWinstonLogger(),
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (config: TJwtConfig): JwtModuleOptions => ({
        global: true,
        secret: config.accessSecret,
        signOptions: {
          expiresIn: config.accessExpiresIn,
        },
      }),
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
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
