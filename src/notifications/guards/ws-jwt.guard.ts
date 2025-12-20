import { IAuthenticatedSocket } from '../types/notification.types';
import { Inject, Injectable } from '@nestjs/common';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { TJwtPayload } from '../../auth/auth.types';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
  ) {}

  verify(client: Socket): IAuthenticatedSocket {
    try {
      const token = client.handshake.query?.token as string;

      if (!token) {
        throw new WsException('Токен не предоставлен');
      }

      // Используем ту же конфигурацию, что и в JwtAccessStrategy
      const payload = this.jwtService.verify<TJwtPayload>(token, {
        secret: this.config.accessSecret,
      });

      // Сохраняем payload в данных клиента для дальнейшего использования
      (client as IAuthenticatedSocket).data.user = payload;

      return client;
    } catch {
      throw new WsException('Недействительный токен');
    }
  }
}
