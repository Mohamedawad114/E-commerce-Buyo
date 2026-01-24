import { Module } from '@nestjs/common';
import {
  Category_Repo,
  commonModule,
  Crypto,
  EmailModule,
  NotificationRepo,
  Order_Repo,
  productRepo,
  UserRepo,
} from 'src/common';
import {
  Dashboard_order_service,
  Dashboard_product_services,
  Dashboard_user_service,
} from './services';
import {
  Dashboard_order_Controller,
  Dashboard_product_Controller,
  Dashboard_user_Controller,
} from './controllers';

import {
  categoryModel,
  notificationModel,
  orderModel,
  ProductModel,
  UserModel,
} from 'src/DB';
import { StripeCheckoutStrategy } from '../payment/strategies/stripe.strategy';
import { realTimeGateway } from '../Gateway/gateway';

@Module({
  imports: [
    EmailModule,
    commonModule,
    ProductModel,
    orderModel,
    UserModel,
    categoryModel,
    notificationModel,
  ],
  providers: [
    Crypto,
    productRepo,
    UserRepo,
    Order_Repo,
    Category_Repo,
    StripeCheckoutStrategy,
    Dashboard_user_service,
    Dashboard_product_services,
    Dashboard_order_service,
    realTimeGateway,
    NotificationRepo,
  ],
  controllers: [
    Dashboard_user_Controller,
    Dashboard_product_Controller,
    Dashboard_order_Controller,
  ],
})
export class dashboardModule {}
