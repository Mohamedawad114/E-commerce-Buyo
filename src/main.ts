import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import {
  GlobalErrorFilter,
  LoggingInterceptor,
  ResponseInterceptor,
  TimeoutInterceptor,
} from './common';
import { ValidationPipe } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new PinoLogger({ pinoHttp: {}, renameContext: 'nestContext' });
  app.enableCors();
  app.use('/payment/webhook', express.raw({ type: 'application/json' }));
  app.use(helmet(), hpp(), cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TimeoutInterceptor(),
    new ResponseInterceptor(),
  );
  app.useGlobalFilters(new GlobalErrorFilter());

  logger.info(`server is runnung... on 3000`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
