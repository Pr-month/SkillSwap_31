import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminSeeder } from './admin.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(AdminSeeder);
  
  try {
    await seeder.seed();
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await app.close();
  }
}

bootstrap();