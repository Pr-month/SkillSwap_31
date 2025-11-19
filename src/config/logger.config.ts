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

    transports: [
      new transports.Console({
        format: format.combine(
          format.printf(({ timestamp, level, message, ...meta }) => {
            let msg = `[${timestamp}] ${level}: ${message}`;
            if (Object.keys(meta).length > 0) {
              msg += ` ${JSON.stringify(meta)}`;
            }
            return msg;
          }),
        ),
      }),
      fileTransport,
    ],

    exceptionHandlers: [fileTransport],
    rejectionHandlers: [fileTransport],
  });
}

