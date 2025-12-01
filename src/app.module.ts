import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SkillsModule } from './skills/skills.module';
import { CategoriesModule } from './categories/categories.module';
import { configuration } from './config/app.config';
import { jwtConfig, TJwtConfig } from './config/jwt.config';
import { dbConfig, TDbConfig } from './config/typeorm.config';
import { createWinstonLogger } from './config/logger.config';
import { Test } from './test.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WinstonModule } from 'nest-winston';
import { FileUploadModule } from './file-upload/file-upload.module';

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
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
