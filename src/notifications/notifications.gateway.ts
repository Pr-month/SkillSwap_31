import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  IAuthenticatedSocket,
  NotificationPayload,
  NotificationType,
} from './types/notification.types';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { websocketConfig } from '../config/websocket.config';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  port: websocketConfig().port,
  cors: websocketConfig().cors,
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      // Проверяем токен и получаем аутентифицированного клиента
      const authenticatedClient = this.wsJwtGuard.verify(client);
      const user = authenticatedClient.data.user;

      // Проверяем, что пользователь определён
      if (!user) {
        this.logger.warn('Подключение отклонено: пользователь не найден');
        client.disconnect();
        return;
      }

      // Присоединяем пользователя к комнате с его ID
      const roomId = user.id;
      await authenticatedClient.join(roomId);

      this.logger.log(
        `Пользователь ${user.name} (ID: ${user.id}) подключился к комнате ${roomId}`,
      );

      // Опционально: отправляем подтверждение подключения
      authenticatedClient.emit('connected', {
        message: 'Успешно подключено к уведомлениям',
        userId: user.id,
      });
    } catch (error) {
      this.logger.error('Ошибка при подключении:', error);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: IAuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Пользователь ${user.name} (ID: ${user.id}) отключился`);
    } else {
      this.logger.log('Неаутентифицированный клиент отключился');
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
