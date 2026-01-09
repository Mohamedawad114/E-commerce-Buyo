import { Module } from '@nestjs/common';
import { commonModule, EmailModule, Order_Repo } from 'src/common';
import { orderModel } from 'src/DB';
import { StripeCheckoutStrategy } from './strategies/stripe.strategy';
import { Payment_Controller } from './payment.controller';
import { Payment_services } from './payment.service';

@Module({
  imports: [commonModule, orderModel,EmailModule],
  providers: [Order_Repo, StripeCheckoutStrategy,Payment_services],
  controllers: [Payment_Controller],
})
export class PaymentModule {}
