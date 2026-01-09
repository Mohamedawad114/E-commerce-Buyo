import { Module } from '@nestjs/common';
import { EmailModule } from '../emails/email.module';
import { orderModel, ProductModel, UserModel } from 'src/DB';
import { Order_Repo, productRepo } from 'src/common/Repository';
import { OrderProducer } from './order.producer';
import { BullModule } from '@nestjs/bullmq';
import { redis } from '../../Services';

@Module({
  imports: [
    EmailModule,
    orderModel,
    ProductModel,
    BullModule.registerQueue({
      name: 'order',
      connection: redis,
    }),
  ],
  providers: [Order_Repo, productRepo, OrderProducer],
})
export class OrderSheduleModule {}
