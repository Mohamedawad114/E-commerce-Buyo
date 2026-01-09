import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { cartModel, couponModel, orderModel, ProductModel } from 'src/DB';
import {
  Cart_Repo,
  commonModule,
  Coupon_Repo,
  Crypto,
  Order_Repo,
  productRepo,
} from 'src/common';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    Cart_Repo,
    productRepo,
    Order_Repo,
    Coupon_Repo,
    Crypto,
  ],
  imports: [orderModel, ProductModel, cartModel, commonModule, couponModel],
})
export class OrderModule {}
