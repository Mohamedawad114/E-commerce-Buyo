import { Module } from '@nestjs/common';
import { commonModule, productRepo, Wishlist_Repo } from 'src/common';
import { ProductModel, wishlistModel } from 'src/DB';
import { Wishlist_services } from './wishlist.service';
import { Wishlist_Controller } from './wishlist.controller';

@Module({
  imports: [commonModule, wishlistModel, ProductModel],
  providers: [Wishlist_Repo, productRepo, Wishlist_services],
  controllers: [Wishlist_Controller],
})
export class WishlistModule {}
