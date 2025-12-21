import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CategoriesSeeder } from './categories.seeder';
import { UsersSeeder } from './users.seeder';
import { SeedCommand } from './commands/seed.command';
import { SkillsSeeder } from './skills.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User])
  ],
  providers: [CategoriesSeeder, UsersSeeder, SkillsSeeder, SeedCommand],
  exports: [CategoriesSeeder, UsersSeeder, SkillsSeeder],
})
export class SeedingModule {}