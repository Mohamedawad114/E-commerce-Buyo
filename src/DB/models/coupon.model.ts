import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { CouponStatus, CouponType, type ICoupon } from 'src/common';

@Schema({ timestamps: true, autoIndex: false, strict: true })
export class Coupon implements ICoupon {
  @Prop({
    type: String,
    required: true,
    minlength: 4,
    maxlength: 25,
  })
  name: string;
  @Prop({ type: String })
  slug: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: [Types.ObjectId], ref: 'User', required: false, default: [] })
  users: Types.ObjectId[];
  @Prop({
    type: Date,
    required: true,
    validate: {
      validator: function (this: Coupon, value: Date) {
        return value < this.endDate;
      },
      message: 'startDate must be before endDate',
    },
  })
  startDate: Date;
  @Prop({ type: Date, required: true })
  endDate: Date;
  @Prop({ type: Number, min: 1, required: true })
  limit: number;
  @Prop({ type: String, enum: CouponType })
  type: CouponType;
  @Prop({ type: String, enum: CouponStatus, default: CouponStatus.active })
  status: CouponStatus;
  @Prop({ type: Date })
  expiredAt: Date;
  @Prop({
    type: Number,
    required: true,
    validate: {
      validator: function (this: Coupon, value: number) {
        if (this.type === CouponType.percent) {
          return value > 0 && value <= 100;
        }
        return value > 0;
      },
      message: 'invalid coupon value',
    },
  })
  value: number;

  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = SchemaFactory.createForClass(Coupon);
couponSchema.index({ name: 1, slug: 1 }, { unique: true });
couponSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 10 });
couponSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
});

export type couponDocument = HydratedDocument<Coupon>;
couponSchema.pre(['updateOne', 'findOneAndUpdate'], async function () {
  const update = this.getUpdate() as couponDocument;
  if (update.name) {
    this.set({ slug: slugify(update.name) });
  }
});

export const couponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
