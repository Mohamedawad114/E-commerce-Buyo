import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ICart, ICartProduct } from 'src/common';
@Schema({
  timestamps: true,
  strict: true,
})
class CartProducts implements ICartProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', requird: true })
  productId: Types.ObjectId;
  @Prop({ type: Number, default: 1 })
  quantity: number;
}

@Schema({ timestamps: true, strict: true })
export class Cart implements ICart {
  @Prop({ type: Types.ObjectId, ref: 'User', requird: true })
  userId: Types.ObjectId;
  @Prop({ type: [CartProducts], required: true })
  products: CartProducts[];

  createdAt: Date;
  updatedAt: Date;
}
const cartSchema = SchemaFactory.createForClass(Cart);
export type CartDocument = HydratedDocument<Cart>;
cartSchema.index({ userId: 1 }, { unique: true });

export const cartModel = MongooseModule.forFeature([
  {
    name: Cart.name,
    schema: cartSchema,
  },
]);
