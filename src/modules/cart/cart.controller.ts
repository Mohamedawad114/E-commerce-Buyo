import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Cart_services } from './cart.service';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { addToCartDto, removeItemDto } from './Dto';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.user)
@Controller('cart')
export class Cart_Controller {
  constructor(private readonly cartServices: Cart_services) {}

  @Post('addToCart')
  @ApiOperation({ summary: 'Add a product to cart' })
  @ApiResponse({
    status: 201,
    description: 'Product added to cart successfully',
  })
  addToCart(@AuthUser() user: IUser, @Body() Dto: addToCartDto) {
    return this.cartServices.addToCart(Dto, user);
  }

  @HttpCode(200)
  @Patch('removeFromCart')
  @ApiOperation({ summary: 'Remove a product from cart' })
  @ApiResponse({ status: 200, description: 'Product removed successfully' })
  removeFromCart(@AuthUser() user: IUser, @Body() Dto: removeItemDto) {
    return this.cartServices.removeProductFromCart(Dto, user);
  }

  @HttpCode(200)
  @Delete('clear-cart')
  @ApiOperation({ summary: 'Clear all products from cart' })
  @ApiResponse({ status: 200, description: 'All products removed from cart' })
  removeAll(@AuthUser() user: IUser) {
    return this.cartServices.removeAllFromCart(user);
  }

  @HttpCode(200)
  @Get()
  @ApiOperation({ summary: 'Get all products in user cart' })
  @ApiResponse({ status: 200, description: 'Return user cart items' })
  userCart(@AuthUser() user: IUser) {
    return this.cartServices.userCart(user._id);
  }

  @HttpCode(200)
  @Get('summary')
  @ApiOperation({ summary: 'Get cart summary (total items, total price)' })
  @ApiResponse({ status: 200, description: 'Return cart summary' })
  summaryCart(@AuthUser() user: IUser) {
    return this.cartServices.summaryCart(user._id);
  }
}
