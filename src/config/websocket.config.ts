import { ConfigType, registerAs } from '@nestjs/config';

export const websocketConfig = registerAs('WEBSOCKET_CONFIG', () => ({
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.WS_ALLOWED_ORIGINS?.split(',') || []
        : '*',
    credentials: true,
  },
}));

export type TWsConfig = ConfigType<typeof websocketConfig>;
