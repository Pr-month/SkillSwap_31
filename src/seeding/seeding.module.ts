import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CategoriesSeeder } from './categories.seeder';
import { UsersSeeder } from './users.seeder';
import { AdminSeeder } from './admin.seeder';
import { SeedCommand } from './commands/seed.command';
import { SkillsSeeder } from './skills.seeder';
import { JwtAccessStrategy } from '../auth/strategies/jwt-access.strategy';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { WsJwtGuard } from '../notifications/guards/ws-jwt.guard';
import { Skill } from '../skills/entities/skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User, Skill])
  ],
  providers: [AdminSeeder, CategoriesSeeder, SeedCommand, UsersSeeder, SkillsSeeder, JwtAccessStrategy, NotificationsGateway, WsJwtGuard],
  exports: [AdminSeeder, CategoriesSeeder, UsersSeeder, SkillsSeeder],
})
export class SeedingModule {}