import { Types } from 'mongoose';

export interface IProduct {
  name: string;
  descripation: string;
  slug?: string;
  ReviewsNumber?: number;
  RateAvg?: number;
  productImgs: string[];
  stock: number;
  originalprice: number;
  discountPercent?: number;
  sold?: number;
  CategoryId: Types.ObjectId;
  BrandId: Types.ObjectId;
  isActive?: boolean;
}
