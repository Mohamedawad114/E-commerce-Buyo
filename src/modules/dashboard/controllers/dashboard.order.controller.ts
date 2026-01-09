import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Auth, orderStatus, Sys_Role } from 'src/common';
import { Types } from 'mongoose';
import { Dashboard_order_service } from '../services/dashboard.order.service';

@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('Dashboard/order')
export class Dashboard_order_Controller {
  constructor(private readonly adminOrderServices: Dashboard_order_service) {}

  @Get('daily-orders')
  dailyOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('status') filter: orderStatus,
  ) {
    return this.adminOrderServices.listDailyOrdersByStatus(filter, page);
  }
  @Get('week-orders')
  weekOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminOrderServices.listWeekOrder(page);
  }
  @Auth(Sys_Role.admin)
  @Patch('cancel-order/:id')
  cancel_order(@Param('id') orderId: Types.ObjectId, @Body('key') key: string) {
    return this.adminOrderServices.cancelOrder(orderId, key);
  }
}
