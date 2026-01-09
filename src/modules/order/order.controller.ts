import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';

import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { Types } from 'mongoose';
import { cancelOrderDto, CreateOrderDto } from './dto';

@Auth(Sys_Role.user)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create-order')
  create(@Body() createOrderDto: CreateOrderDto, @AuthUser() user: IUser) {
    return this.orderService.create(createOrderDto, user);
  }

  @Patch('cancel/:id')
  cancel_order(
    @Param('id') orderId: Types.ObjectId,
    @Body() Dto: cancelOrderDto,
    @AuthUser() user: IUser,
  ) {
    return this.orderService.cancelOrder(Dto, user, orderId);
  }

  @Get(':id')
  getOrder(@Param('id') orderId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.orderService.getOrder(orderId, user);
  }

  @Get('/')
  getUserOrders(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.orderService.getOrders(user, page);
  }
}
