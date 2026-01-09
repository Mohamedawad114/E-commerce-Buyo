import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true, autoIndex: false, strict: true, strictQuery: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  ProductsNumber: number;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], required: true })
  productIds: Types.ObjectId[];
}

const WishlistSchema = SchemaFactory.createForClass(Wishlist);
export type WishlistDocument = HydratedDocument<Wishlist>;
WishlistSchema.index({ userId: 1 }, { unique: true, name: 'userId_unique' });
export const wishlistModel = MongooseModule.forFeature([
  {
    schema: WishlistSchema,
    name: Wishlist.name,
  },
]);
