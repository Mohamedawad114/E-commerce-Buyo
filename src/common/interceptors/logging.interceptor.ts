import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(@InjectPinoLogger(LoggingInterceptor.name) private readonly logger:PinoLogger){}

intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const request = context.switchToHttp().getRequest();
  const method = request.method;
  const url = request.url;

  this.logger.info(`Incoming Request: [${method}] ${url}`);
  const now = Date.now();

  return next
    .handle()
    .pipe(
      tap(() =>
        this.logger.info(
          `Response: [${method}] ${url} - ${Date.now() - now}ms`,
        ),
      ),
    );
}
  }
