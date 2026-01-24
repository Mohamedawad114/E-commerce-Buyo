import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { Payment_services } from './payment.service';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { Types } from 'mongoose';
import { type Request } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Payment') // تبويب الـ Payment في Swagger
@Controller('payment')
export class Payment_Controller {
  constructor(private readonly paymentServices: Payment_services) {}

  @Post('/webhook')
  @ApiOperation({ summary: 'Handle payment provider webhook' })
  webhook(@Req() req: Request) {
    return this.paymentServices.webhook(req);
  }

  @Auth(Sys_Role.user)
  @Post(':orderId')
  @ApiOperation({ summary: 'Checkout payment for an order' })
  @ApiParam({ name: 'orderId', description: 'ID of the order', type: String })
  @ApiBody({
    description: 'Secret key for the payment',
    schema: { type: 'object', properties: { key: { type: 'string' } } },
  })
  checkout(
    @AuthUser() user: IUser,
    @Param('orderId') orderId: Types.ObjectId,
    @Body('key') key: string,
  ) {
    return this.paymentServices.cheackout(orderId, user, key);
  }
}
