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
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Dashboard Orders')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('Dashboard/order')
export class Dashboard_order_Controller {
  constructor(private readonly adminOrderServices: Dashboard_order_service) {}

  @ApiOperation({ summary: 'List daily orders filtered by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'status', required: false, enum: orderStatus })
  @Get('daily-orders')
  dailyOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('status') filter: orderStatus,
  ) {
    return this.adminOrderServices.listDailyOrdersByStatus(filter, page);
  }

  @ApiOperation({ summary: 'List orders of the current week' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('week-orders')
  weekOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminOrderServices.listWeekOrder(page);
  }

  @ApiOperation({ summary: 'Cancel an order by admin' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiBody({
    description: 'Cancellation key',
    schema: {
      type: 'object',
      properties: { key: { type: 'string', example: 'ADMIN_CANCEL' } },
    },
  })
  @Auth(Sys_Role.admin)
  @Patch('cancel-order/:id')
  cancel_order(@Param('id') orderId: Types.ObjectId, @Body('key') key: string) {
    return this.adminOrderServices.cancelOrder(orderId, key);
  }
}
