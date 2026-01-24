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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { Types } from 'mongoose';
import { Coupon_services } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto } from './Dto';

@ApiTags('Coupons')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/coupon')
export class Coupon_Controller {
  constructor(private readonly couponServices: Coupon_services) {}

  @HttpCode(200)
  @Get('/active-list')
  @ApiOperation({ summary: 'Get all active coupons with pagination' })
  @ApiResponse({ status: 200, description: 'Return list of active coupons' })
  getActiveCoupons(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.couponServices.getActiveCoupons(page);
  }

  @HttpCode(200)
  @Get('/:id')
  @ApiOperation({ summary: 'Get a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Return coupon data' })
  getCoupon(@Param('id') couponId: Types.ObjectId) {
    return this.couponServices.getCoupon(couponId);
  }

  @Post('/create-coupon')
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  craeteCouopon(@AuthUser() user: IUser, @Body() Dto: CreateCouponDto) {
    return this.couponServices.createCoupon(Dto, user);
  }

  @HttpCode(200)
  @Put('/update/:id')
  @ApiOperation({ summary: 'Update an existing coupon' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  updateCoupon(
    @Param('id') couponId: Types.ObjectId,
    @Body() Dto: UpdateCouponDto,
  ) {
    return this.couponServices.updateCoupon(Dto, couponId);
  }

  @HttpCode(200)
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  deleteCoupon(@Param('id') couponId: Types.ObjectId) {
    return this.couponServices.deleteCoupon(couponId);
  }
}
