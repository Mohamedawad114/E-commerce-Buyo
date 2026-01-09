import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';

import { Types } from 'mongoose';
import { Coupon_services } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto } from './Dto';

@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/coupon')
export class Coupon_Controller {
  constructor(private readonly couponServices: Coupon_services) {}
  @HttpCode(200)
  @Get('/active-list')
  getActiveCoupons(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.couponServices.getActiveCoupons(page);
  }
  @HttpCode(200)
  @Get('/:id')
  getCoupon(@Param('id') couponId: Types.ObjectId) {
    return this.couponServices.getCoupon(couponId);
  }
  @Auth(Sys_Role.admin)
  @Post('/create-coupon')
  craeteCouopon(@AuthUser() user: IUser, @Body() Dto: CreateCouponDto) {
    return this.couponServices.createCoupon(Dto, user);
  }
  @Auth(Sys_Role.admin)
  @HttpCode(200)
  @Put('/update/:id')
  updateCoupon(
    @Param('id') couponId: Types.ObjectId,
    @Body() Dto: UpdateCouponDto,
  ) {
    return this.couponServices.updateCoupon(Dto, couponId);
  }

  @HttpCode(200)
  @Delete('/delete/:id')
  deleteCoupon(@Param('id') couponId: Types.ObjectId) {
    return this.couponServices.deleteCoupon(couponId);
  }
}
