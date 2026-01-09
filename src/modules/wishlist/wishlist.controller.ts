import { Body, Controller, Delete, Get, HttpCode, Patch } from '@nestjs/common';
import { wishListDto } from './Dto';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { Wishlist_services } from './wishlist.service';
@Auth(Sys_Role.user)
@Controller('user/wishlist')
export class Wishlist_Controller {
  constructor(private readonly wishlistServices: Wishlist_services) {}
  @HttpCode(200)
  @Get()
  getMyWishlist(@AuthUser() user: IUser) {
    return this.wishlistServices.userWishList(user);
  }
  @Patch('add-product')
  addToWishlist(@Body() Dto: wishListDto, @AuthUser() user: IUser) {
    return this.wishlistServices.addToWishList(Dto, user);
  }
  @Delete('remove-product')
  removeFromyWishlist(@Body() Dto: wishListDto, @AuthUser() user: IUser) {
    return this.wishlistServices.removeFromWishList(Dto, user);
  }
}
