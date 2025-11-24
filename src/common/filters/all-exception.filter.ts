import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface PostgresDriverError {
  code?: string;
  detail?: string;
}

// тип-предикат для безопасной проверки driverError
function isPostgresDriverError(err: unknown): err is PostgresDriverError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('code' in err || 'detail' in err)
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. 404 — entity not found
    if (exception instanceof EntityNotFoundError) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Entity not found',
      });
    }

    // 2. 409 — duplicate (Postgres 23505)
    if (exception instanceof QueryFailedError) {
      const original: unknown = (exception as QueryFailedError).driverError;

      if (isPostgresDriverError(original)) {
        if (original.code === '23505') {
          return response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: 'Duplicate entry',
            detail: original.detail ?? null,
          });
        }
      }
    }

    // 3. 413 — too large
    if (exception instanceof PayloadTooLargeException) {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'File too large',
      });
    }

    // 4. вернуть HttpException как есть
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // 5. 500 — всё остальное
    console.error('Unhandled exception:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
