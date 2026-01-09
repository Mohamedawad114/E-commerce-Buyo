import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IReview } from 'src/common';

@Schema({ strict: true, strictQuery: true, autoIndex: false, timestamps: true })
export class Review implements IReview {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({
    type: Number,
    max: 5,
    min: 1,
    required: true,
  })
  stars: number;
  @Prop({
    type: String,
  })
  content: string;
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = SchemaFactory.createForClass(Review);
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type ReviewDocument = HydratedDocument<Review>;
export const reviewModel = MongooseModule.forFeature([
  {
    schema: reviewSchema,
    name: Review.name,
  },
]);
