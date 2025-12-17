import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { TAuthenticatedSocket } from '../types/notification.types';
import { TJwtPayload } from '../../auth/auth.types';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: TAuthenticatedSocket = context.switchToWs().getClient();
      const token = client.handshake.query?.token as string;

      if (!token) {
        throw new WsException('Токен не предоставлен');
      }

      // Используем ту же конфигурацию, что и в JwtAccessStrategy
      const payload = this.jwtService.verify<TJwtPayload>(token, {
        secret: this.config.accessSecret,
      });

      // Сохраняем payload в данных клиента для дальнейшего использования
      client.data.user = payload;

      return true;
    } catch {
      throw new WsException('Недействительный токен');
    }
  }
}
