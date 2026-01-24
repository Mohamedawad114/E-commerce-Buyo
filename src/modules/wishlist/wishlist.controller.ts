import { Body, Controller, Delete, Get, HttpCode, Patch } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { wishListDto } from './Dto';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { Wishlist_services } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.user)
@Controller('user/wishlist')
export class Wishlist_Controller {
  constructor(private readonly wishlistServices: Wishlist_services) {}

  @HttpCode(200)
  @Get()
  @ApiOperation({ summary: 'Get my wishlist' })
  @ApiResponse({ status: 200, description: 'Return user wishlist' })
  getMyWishlist(@AuthUser() user: IUser) {
    return this.wishlistServices.userWishList(user);
  }

  @HttpCode(200)
  @Patch('add-product')
  @ApiOperation({ summary: 'Add a product to wishlist' })
  @ApiResponse({ status: 200, description: 'Product added successfully' })
  addToWishlist(@Body() Dto: wishListDto, @AuthUser() user: IUser) {
    return this.wishlistServices.addToWishList(Dto, user);
  }

  @HttpCode(200)
  @Delete('remove-product')
  @ApiOperation({ summary: 'Remove a product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed successfully' })
  removeFromWishlist(@Body() Dto: wishListDto, @AuthUser() user: IUser) {
    return this.wishlistServices.removeFromWishList(Dto, user);
  }
}
