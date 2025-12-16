import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CategoriesSeeder } from './categories.seeder';
import { UsersSeeder } from './users.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const categoriesSeeder = app.get(CategoriesSeeder);
  const usersSeeder = app.get(UsersSeeder);
  
  try {
    console.log('Запуск сидинга всех данных...');
    await categoriesSeeder.seed();
    await usersSeeder.seed();
    console.log('Данные успешно загружены!');
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();