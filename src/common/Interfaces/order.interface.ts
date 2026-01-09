import { Types } from 'mongoose';
import { orderStatus, paymentType } from '../Enums';

export interface IorderProduct {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}
export interface IOrder {
  userId: Types.ObjectId;
  orderId: string;
  final_price: number;
  note?: string;
  cancelReson?: string;
  address: string;
  phoneNumber: string;
  status: orderStatus;
  paymentType: paymentType;
  coupon?: Types.ObjectId;
  discount?: number;
  discountAmount?: number;
  paymentId?: string;
  products: IorderProduct[];
}
