import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const anyRes = res as any;
        message = Array.isArray(anyRes.message)
          ? anyRes.message.join(', ')
          : anyRes.message || anyRes.error || message;
        code = anyRes.error || HttpStatus[status] || code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status === HttpStatus.FORBIDDEN) {
      code = 'FORBIDDEN';
    } else if (status === HttpStatus.UNAUTHORIZED) {
      code = 'UNAUTHORIZED';
    } else if (status === HttpStatus.NOT_FOUND) {
      code = 'NOT_FOUND';
    } else if (status === HttpStatus.CONFLICT) {
      code = 'CONFLICT';
    } else if (status === HttpStatus.BAD_REQUEST) {
      code = 'BAD_REQUEST';
    }

    response.status(status).json({
      success: false,
      message,
      code,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
