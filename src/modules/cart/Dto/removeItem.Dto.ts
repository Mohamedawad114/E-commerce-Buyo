import { IsMongoId} from 'class-validator';
import { Types } from 'mongoose';

export class removeItemDto  {
  @IsMongoId()
  productId: Types.ObjectId;
}
