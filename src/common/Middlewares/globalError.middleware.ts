import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json({
        success: false,
        message: (res as any).message || exception.message,
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }
    return response.status(500).json({
      success: false,
      message: 'something broking',
      context: exception.message,
      stack: exception.stack,
      path: request.url,
    });
  }
}
