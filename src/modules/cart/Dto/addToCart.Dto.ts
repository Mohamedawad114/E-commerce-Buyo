import { IsMongoId, IsNumber, IsPositive, Min } from 'class-validator';
import { Types } from 'mongoose';
import { ICartProduct } from 'src/common';

export class addToCartDto implements ICartProduct {
  @IsMongoId()
  productId: Types.ObjectId;
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
