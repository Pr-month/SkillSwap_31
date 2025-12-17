import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import {
  NotificationPayload,
  NotificationType,
  TAuthenticatedSocket,
} from './types/notification.types';
import { Server } from 'socket.io';
import { TWsConfig, websocketConfig } from '../config/websocket.config';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: websocketConfig().cors,
})
@UseGuards(WsJwtGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    @Inject(websocketConfig.KEY)
    private readonly wsConfig: TWsConfig,
  ) {}

  async handleConnection(@ConnectedSocket() client: TAuthenticatedSocket) {
    try {
      // Получаем пользователя из данных клиента (установлено в WsJwtGuard)
      const user = client.data.user;

      if (!user) {
        this.logger.warn('Подключение отклонено: нет авторизации');
        client.disconnect();
        return;
      }

      // Присоединяем пользователя к комнате с его ID
      const roomId = user.id;
      await client.join(roomId);

      this.logger.log(
        `Пользователь ${user.name} (ID: ${user.id}) подключился к комнате ${roomId}`,
      );

      // Опционально: отправляем подтверждение подключения
      client.emit('connected', {
        message: 'Успешно подключено к уведомлениям',
        userId: user.id,
      });
    } catch (error) {
      this.logger.error('Ошибка при подключении:', error);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: TAuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Пользователь ${user.name} (ID: ${user.id}) отключился`);
    }
  }

  /**
   * Уведомление о новой заявке
   */
  notifyNewRequest(userId: string, payload: Omit<NotificationPayload, 'type'>) {
    const fullPayload = {
      ...payload,
      type: NotificationType.NEW_REQUEST,
    };

    this.logger.log(
      `Отправка уведомления о новой заявке пользователю ${userId}`,
    );

    this.server.to(userId).emit('notificateNewRequest', fullPayload);
  }

  /**
   * Уведомление о принятии заявки
   */
  notifyRequestAccepted(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ) {
    const fullPayload = {
      ...payload,
      type: NotificationType.REQUEST_ACCEPTED,
    };

    this.logger.log(
      `Отправка уведомления о принятии заявки пользователю ${userId}`,
    );

    this.server.to(userId).emit('notificateRequestAccepted', fullPayload);
  }

  /**
   * Уведомление об отклонении заявки
   */
  notifyRequestRejected(
    userId: string,
    payload: Omit<NotificationPayload, 'type'>,
  ) {
    const fullPayload = {
      ...payload,
      type: NotificationType.REQUEST_REJECTED,
    };

    this.logger.log(
      `Отправка уведомления об отклонении заявки пользователю ${userId}`,
    );

    this.server.to(userId).emit('notificateRequestRejected', fullPayload);
  }
}
