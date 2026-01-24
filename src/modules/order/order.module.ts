import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { cartModel, couponModel, notificationModel, orderModel, ProductModel } from 'src/DB';
import {
  Cart_Repo,
  commonModule,
  Coupon_Repo,
  Crypto,
  NotificationRepo,
  Order_Repo,
  productRepo,
} from 'src/common';
import { realTimeGateway } from '../Gateway/gateway';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    Cart_Repo,
    productRepo,
    Order_Repo,
    Coupon_Repo,
    Crypto,
    realTimeGateway,
    NotificationRepo,
  ],
  imports: [orderModel, ProductModel, cartModel, commonModule, couponModel, notificationModel],
})
export class OrderModule {}
