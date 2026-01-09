import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Coupon_Repo, CouponStatus, IUser } from 'src/common';
import { CreateCouponDto, UpdateCouponDto } from './Dto';
import { Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';

@Injectable()
export class Coupon_services {
  constructor(
    private readonly couponRepo: Coupon_Repo,
    private logger: Logger,
  ) {}
  @Cron('*/5 * * * *')
  async expireCoupons() {
    const now = Date.now();
    await this.couponRepo.updateManyDocuments(
      { status: CouponStatus.active, endDate: { $lte: now } },
      { $set: { status: CouponStatus.expired, expiredAt: now } },
    );
    this.logger.log('Cron ran: updated expired coupons');
  }

  createCoupon = async (Dto: CreateCouponDto, user: IUser) => {
    const isDublicated = await this.couponRepo.findOneDocument({
      name: Dto.name,
      status: CouponStatus.active,
    });
    if (isDublicated) throw new ConflictException('coupon name is dublicated');
    const startDate = new Date(Dto.startDate);
    const endDate = new Date(Dto.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today || endDate < today)
      throw new BadRequestException('dates must be today or future');
    
    if (Dto.startDate > Dto.endDate)
      throw new BadRequestException('endDate must greater than startDate');
    const create = await this.couponRepo.createDocument({
      ...Dto,
      createdBy: user._id,
    });
    return { message: 'coupon created', data: create };
  };
  updateCoupon = async (Dto: UpdateCouponDto, couponId: Types.ObjectId) => {
    const coupon = await this.couponRepo.findOneDocument({
      _id: couponId,
      status: CouponStatus.active,
    });
    if (!coupon) throw new NotFoundException('coupon not found or isExpired');
    if (Dto.name) {
      const isDublicated = await this.couponRepo.findOneDocument({
        name: Dto.name,
        isExpired: false,
      });
      if (isDublicated)
        throw new ConflictException('coupon name is dublicated');
    }
    if (Dto.limit < coupon.users.length)
      throw new BadRequestException('limit must greater than users');
    const updated = await this.couponRepo.updateDocument(
      { _id: couponId },
      {
        ...Dto,
      },
    );
    return { message: 'coupon updated', data: updated };
  };
  deleteCoupon = async (couponId: Types.ObjectId) => {
    const coupon = await this.couponRepo.findOneDocument({
      _id: couponId,
      status: CouponStatus.active,
    });
    if (!coupon) throw new NotFoundException('coupon not found or isExpired');
    const deleteCoupon = await this.couponRepo.deleteDocument({
      _id: couponId,
    });
    return { message: 'coupon deleted', data: deleteCoupon };
  };
  getCoupon = async (couponId: Types.ObjectId) => {
    const coupon = await this.couponRepo.findOneDocument({
      _id: couponId,
      status: CouponStatus.active,
    });
    if (!coupon) throw new NotFoundException('coupon not found or isExpired');
    return { message: 'coupon ', data: coupon };
  };
  getActiveCoupons = async (page: number) => {
    const limit = 15;
    const offset = (page - 1) * limit;
    const coupons = await this.couponRepo.findDocuments(
      {
        status: CouponStatus.active,
      },
      {},
      {
        skip: offset,
        limit,
        sort: { createdAt: -1 },
        lean: true,
      },
    );
    if (!coupons.length) return { message: 'no coupons found ' };
    return { message: 'coupon ', data: coupons };
  };
}
