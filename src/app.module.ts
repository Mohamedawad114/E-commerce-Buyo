import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  dashboardModule,
  AuthModule,
  BrandModule,
  CategoryModule,
  UserModule,
  WishlistModule,
  ProductModule,
  ReviewModule,
  CartModule,
  CouponModule,
  OrderModule,
  PaymentModule,
  HomeModule,
} from './modules';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { resolve } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule, OrderSheduleModule, redis } from './common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/dev.env'),
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      },
      renameContext: 'ctx',
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    BullModule.forRoot({ connection: redis }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 4000,
      },
    ]),

    ScheduleModule.forRoot(),
    HomeModule,
    EmailModule,
    OrderSheduleModule,
    AuthModule,
    UserModule,
    dashboardModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    WishlistModule,
    ReviewModule,
    CartModule,
    CouponModule,
    OrderModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
