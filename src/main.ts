import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configuration, IConfig } from './config/app.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<IConfig>('APP_CONFIG');
  
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Приложение запущено на порту ${appConfig.port}`, 'Bootstrap');
  
  await app.listen(appConfig.port);
}
void bootstrap();
