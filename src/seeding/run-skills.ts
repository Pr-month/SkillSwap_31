import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SkillsSeeder } from './skills.seeder';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(SkillsSeeder);
    
    try {
        await seeder.seed();
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await app.close();
    }
}

bootstrap();