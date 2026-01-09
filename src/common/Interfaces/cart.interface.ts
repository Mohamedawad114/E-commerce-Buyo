import { Types } from 'mongoose';

export interface ICartProduct {
  productId: Types.ObjectId;
  quantity: number;
}
export interface ICart {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  products: ICartProduct[];
  total_price?: number;
}
