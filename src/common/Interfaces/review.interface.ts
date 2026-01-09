import { Types } from 'mongoose';

export interface IReview {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  stars: number;
  content: string;
}
