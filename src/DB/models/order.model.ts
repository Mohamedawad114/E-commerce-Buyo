import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IOrder, IorderProduct, orderStatus, paymentType } from 'src/common';

@Schema({ strict: true })
class OrderProducts implements IorderProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
  @Prop({ type: Number, default: 1 })
  quantity: number;
  @Prop({ type: Number, required: true })
  price: number;
}

@Schema({ timestamps: true, autoIndex: false, strict: true })
export class Order implements IOrder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: String, required: true })
  orderId: string;
  @Prop({ type: Number, required: false })
  final_price: number;
  @Prop({ type: Number, required: true })
  subTotal: number;
  @Prop({ type: String, required: false, trim: true, min: 2, max: 200 })
  note: string;
  @Prop({ type: String, required: false, trim: true, min: 2, max: 500 })
  cancelReson: string;
  @Prop({ type: String, required: true, trim: true, min: 2, max: 500 })
  address: string;
  @Prop({ type: String, required: true, trim: true })
  phoneNumber: string;
  @Prop({
    type: String,
    enum: orderStatus,
    default: orderStatus.Pending,
    required: true,
    trim: true,
  })
  status: orderStatus;
  @Prop({ type: String, enum: paymentType, required: true, trim: true })
  paymentType: paymentType;
  @Prop({ type: Types.ObjectId, ref: 'Coupon', required: false })
  coupon: Types.ObjectId;
  @Prop({ type: Number, required: false })
  discount: number;
  @Prop({ type: Number, required: false })
  discountAmount: number;
  @Prop({ type: String, required: false, trim: true })
  paymentId: string;
  @Prop({ type: [OrderProducts], required: true })
  products: OrderProducts[];
  @Prop({ type: Date, required: false })
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = SchemaFactory.createForClass(Order);
export type orderDocument = HydratedDocument<Order>;
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, _id: 1 });

orderSchema.pre('save', function () {
  let finalPrice = this.subTotal;
  if (this.discount && this.discount > 0)
    finalPrice -= this.subTotal * this.discount;
  else if (this.discountAmount && this.discountAmount > 0)
    finalPrice -= this.discountAmount;
  this.final_price = Math.max(finalPrice, 0);
});

export const orderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
