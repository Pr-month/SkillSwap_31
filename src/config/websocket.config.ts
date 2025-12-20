import { ConfigType, registerAs } from '@nestjs/config';

export const websocketConfig = registerAs('WEBSOCKET_CONFIG', () => ({
  port: Number(process.env.NOTIFICATIONS_WS_PORT) || 4000,
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.NOTIFICATIONS_WS_ALLOWED_ORIGINS?.split(',') || []
        : '*',
    credentials: true,
  },
}));

export type TWsConfig = ConfigType<typeof websocketConfig>;
