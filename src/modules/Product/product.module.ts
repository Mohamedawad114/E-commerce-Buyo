import { Module } from '@nestjs/common';
import {
  Brand_Repo,
  Cart_Repo,
  Category_Repo,
  commonModule,
  productRepo,
  ReviewRepo,
  s3_services,
  Wishlist_Repo,
} from 'src/common';
import {
  BrandModel,
  cartModel,
  categoryModel,
  ProductModel,
  reviewModel,
  wishlistModel,
} from 'src/DB';
import { Product_Servcies } from './product.service';
import { Product_Controller, Product_User_Controller } from './controllers';

@Module({
  imports: [
    ProductModel,
    categoryModel,
    BrandModel,
    commonModule,
    wishlistModel,
    reviewModel,
    cartModel,
  ],
  providers: [
    productRepo,
    Brand_Repo,
    Category_Repo,
    Product_Servcies,
    s3_services,
    Wishlist_Repo,
    Cart_Repo,
    ReviewRepo,
  ],
  controllers: [Product_Controller, Product_User_Controller],
})
export class ProductModule {}
