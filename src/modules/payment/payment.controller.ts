import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { Payment_services } from './payment.service';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { Types } from 'mongoose';
import { type Request } from 'express';


@Controller('payment')
export class Payment_Controller {
  constructor(private readonly paymentServices: Payment_services) {}

  @Post('/webhook')
  webhook(@Req() req: Request) {
    return this.paymentServices.webhook(req);
  }
  @Auth(Sys_Role.user)
  @Post(':orderId')
  checkout(
    @AuthUser() user: IUser,
    @Param('orderId') orderId: Types.ObjectId,
    @Body('key') key: string,
  ) {
    return this.paymentServices.cheackout(orderId, user, key);
  }
}
