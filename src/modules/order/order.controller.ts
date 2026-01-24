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
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Orders')
@Auth(Sys_Role.user)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create a new order for the authenticated user' })
  @Post('create-order')
  create(@Body() createOrderDto: CreateOrderDto, @AuthUser() user: IUser) {
    return this.orderService.create(createOrderDto, user);
  }

  @ApiOperation({ summary: 'Cancel an existing order' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID to cancel' })
  @Patch('cancel/:id')
  cancel_order(
    @Param('id') orderId: Types.ObjectId,
    @Body() Dto: cancelOrderDto,
    @AuthUser() user: IUser,
  ) {
    return this.orderService.cancelOrder(Dto, user, orderId);
  }

  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @Get(':id')
  getOrder(@Param('id') orderId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.orderService.getOrder(orderId, user);
  }

  @ApiOperation({ summary: 'Get paginated orders of the authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('/')
  getUserOrders(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.orderService.getOrders(user, page);
  }
}
