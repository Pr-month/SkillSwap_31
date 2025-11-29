import { createLogger, format, transports, Logger } from 'winston';
import * as path from 'path';

export function createWinstonLogger(): Logger {
  const logFile = path.join(process.cwd(), 'logs', 'app.log');

  const fileTransport = new transports.File({
    filename: logFile,
    maxsize: 5242880,
    maxFiles: 5,
  });

  return createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    transports: [fileTransport],
    exceptionHandlers: [fileTransport],
    rejectionHandlers: [fileTransport],
  });
}
