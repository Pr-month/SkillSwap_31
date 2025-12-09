import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './config/app.config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<IConfig>('APP_CONFIG');
  await app.listen(appConfig.port);
}
void bootstrap();
