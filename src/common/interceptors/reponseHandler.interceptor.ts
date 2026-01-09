import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => ({
        message: data.message || 'Success',
        statusCode,
        data: data.data,
        meta: data.meta,
      })),
    );
  }
}
