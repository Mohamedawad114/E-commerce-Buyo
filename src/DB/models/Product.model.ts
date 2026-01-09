import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from 'src/common';

@Schema({ strict: true, timestamps: true, autoIndex: false })
export class Product implements IProduct {
  @Prop({
    required: true,
    type: String,
    minlength: 4,
    maxlength: 64,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    minlength: 10,
    maxlength: 1000,
  })
  descripation: string;
  @Prop({ required: false, type: String })
  slug: string;
  @Prop({ default: 0, type: Number })
  reviewsNumber: number;
  @Prop({ default: 0, type: Number })
  rateAvg: number;
  @Prop({ type: [String], default: [] })
  productImgs: string[];
  @Prop({ type: Number, required: true })
  stock: number;
  @Prop({ type: Number, required: true })
  originalprice: number;
  @Prop({
    type: Number,
    required: false,
    default: 0,
    max: 40,
  })
  discountPercent: number;
  @Prop({
    type: Number,
  })
  saleprice: number;
  @Prop({ default: 0, type: Number, required: false })
  sold: number;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Category' })
  CategoryId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Brand' })
  BrandId: Types.ObjectId;
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;
const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ slug: 1 });
ProductSchema.index({ CategoryId: 1 });
ProductSchema.index({ BrandId: 1 });
ProductSchema.index({
  name: 'text',
  slug: 'text',
  descripation: 'text',
});
ProductSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  if (this.isModified('originalprice') || this.isModified('discountPercent')) {
    this.saleprice = calcSalePrice(this.originalprice, this.discountPercent);
  }
});
ProductSchema.pre(['updateOne', 'findOneAndUpdate'], async function () {
  const update = this.getUpdate() as any;
  const set = update.$set ?? update;
  if (set.originalPrice !== undefined || set.discountPercent !== undefined) {
    const doc = await this.model
      .findOne(this.getQuery())
      .select('originalPrice discountPercent');
    if (!doc) return;
    const price = set.originalPrice ?? doc.originalPrice;
    const discount = set.discountPercent ?? doc.discountPercent;
    this.set({
      salePrice: calcSalePrice(price, discount),
    });
  }
  if (set.name) {
    this.set({ slug: slugify(set.name, { lower: true }) });
  }
});
function calcSalePrice(originalprice: number, discountPercent: number) {
  return Math.round(originalprice - originalprice * (discountPercent / 100));
}

export const ProductModel = MongooseModule.forFeature([
  { schema: ProductSchema, name: Product.name },
]);
