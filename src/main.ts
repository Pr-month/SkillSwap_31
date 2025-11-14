import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Удаляет все поля, которые не описаны в dto
      forbidNonWhitelisted: true, //Выбрасывает ошибку 400, если в запросе есть поля, не описанные в dto
      transform: true, //Автоматически преобразует входящие данные к типам, указанным в dto
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
