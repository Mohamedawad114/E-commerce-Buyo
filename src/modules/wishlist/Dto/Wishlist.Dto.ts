import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { IWishlist } from 'src/common';

export class wishListDto implements Partial<IWishlist> {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId;
}
