import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtConfig } from '../config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
