import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CategoriesSeeder } from './categories.seeder';
import { UsersSeeder } from './users.seeder';
import { AdminSeeder } from './admin.seeder';
import { SeedCommand } from './commands/seed.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User])
  ],
  providers: [AdminSeeder, CategoriesSeeder, SeedCommand, UsersSeeder],
  exports: [AdminSeeder, CategoriesSeeder, UsersSeeder],
})
export class SeedingModule {}