import { Module } from '@nestjs/common';
import { commonModule, Coupon_Repo } from 'src/common';
import { couponModel } from 'src/DB';
import { Coupon_services } from './coupon.service';
import { Coupon_Controller } from './coupon.controller';

@Module({
  providers: [Coupon_Repo, Coupon_services],
  imports: [couponModel, commonModule],
  controllers: [Coupon_Controller],
})
export class CouponModule {}
