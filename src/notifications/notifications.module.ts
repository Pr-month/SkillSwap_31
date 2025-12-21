import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { websocketConfig } from '../config/websocket.config';
import { jwtConfig } from '../config/jwt.config';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [JwtModule, ConfigModule.forFeature(websocketConfig), ConfigModule.forFeature(jwtConfig),],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
