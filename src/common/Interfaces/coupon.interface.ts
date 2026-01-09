import { Types } from 'mongoose';
import { CouponStatus, CouponType } from '../Enums';

export interface ICoupon {
  name: string;
  slug?: string;
  startDate: Date;
  endDate: Date;
  type: CouponType;
  limit: number;
  users: Types.ObjectId[];
  createdBy: Types.ObjectId;
  status: CouponStatus;
  value: number;
}
