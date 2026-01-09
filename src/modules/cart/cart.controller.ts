import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Cart_services } from './cart.service';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { addToCartDto, removeItemDto } from './Dto';
import { Types } from 'mongoose';
@Auth(Sys_Role.user)
@Controller('cart')
export class Cart_Controller {
  constructor(private readonly cartServices: Cart_services) {}

  @Post('addToCart')
  addToCart(@AuthUser() user: IUser, @Body() Dto: addToCartDto) {
    return this.cartServices.addToCart(Dto, user);
  }
  @HttpCode(200)
  @Patch('removeFromCart')
  removeFromCart(@AuthUser() user: IUser, @Body() Dto: removeItemDto) {
    return this.cartServices.removeProductFromCart(Dto, user);
  }
  @HttpCode(200)
  @Delete('clear-cart')
  removeAll(@AuthUser() user: IUser) {
    return this.cartServices.removeAllFromCart(user);
  }
  @HttpCode(200)
  @Get()
  userCart(@AuthUser() user: IUser) {
    return this.cartServices.userCart(user._id);
  }
  @HttpCode(200)
  @Get("summary")
  summaryCart(@AuthUser() user: IUser) {
    return this.cartServices.summaryCart(user._id);
  }
}
