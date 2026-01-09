import { Model } from 'mongoose';
import { BaseRepository } from './Base.repository';
import {  Coupon, couponDocument } from 'src/DB';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Coupon_Repo extends BaseRepository<couponDocument> {
  constructor(
    @InjectModel(Coupon.name) protected couponModel: Model<couponDocument>,
  ) {
    super(couponModel);
  }
  async updateCoupon(coupon: couponDocument): Promise<couponDocument> {
    return await coupon.save();
  }
}
