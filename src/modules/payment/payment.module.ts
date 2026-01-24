import { Module } from '@nestjs/common';
import {
  commonModule,
  EmailModule,
  NotificationRepo,
  Order_Repo,
} from 'src/common';
import { notificationModel, orderModel } from 'src/DB';
import { StripeCheckoutStrategy } from './strategies/stripe.strategy';
import { Payment_Controller } from './payment.controller';
import { Payment_services } from './payment.service';
import { realTimeGateway } from '../Gateway/gateway';

@Module({
  imports: [commonModule, orderModel, EmailModule, notificationModel],
  providers: [
    Order_Repo,
    StripeCheckoutStrategy,
    Payment_services,
    NotificationRepo,
    realTimeGateway,
  ],
  controllers: [Payment_Controller],
})
export class PaymentModule {}
