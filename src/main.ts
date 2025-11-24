import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { IConfig } from './config/app.config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<IConfig>('APP_CONFIG');
  await app.listen(appConfig.port);
}
void bootstrap();
