import { Module } from '@nestjs/common';
import { Cart_Repo, commonModule, productRepo } from 'src/common';
import { ProductModel } from 'src/DB';
import { cartModel } from 'src/DB/models/cart.model';
import { Cart_services } from './cart.service';
import { Cart_Controller } from './cart.controller';

@Module({
  imports: [cartModel, commonModule, ProductModel],
  providers: [Cart_Repo, productRepo, Cart_services],
  controllers: [Cart_Controller],
})
export class CartModule {}
