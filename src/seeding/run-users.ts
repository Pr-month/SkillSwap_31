import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersSeeder } from './users.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(UsersSeeder);
  
  try {
    await seeder.seed();
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await app.close();
  }
}

bootstrap();