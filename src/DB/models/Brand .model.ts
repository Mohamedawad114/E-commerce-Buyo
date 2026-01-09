import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { s3_services } from 'src/common';

@Schema({ timestamps: true, autoIndex: false, strict: true })
export class Brand {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 25,
  })
  name: string;
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  Slogan: string;
  @Prop({ type: String, required: true })
  logo: string;
  @Prop({ type: String })
  slug: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId | String;
  @Prop({ type: Boolean, default: false })
  DeActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = SchemaFactory.createForClass(Brand);
export type BrandDocument = HydratedDocument<Brand>;
BrandSchema.index({ name: 1, slug: 1 }, { unique: true });
BrandSchema.index({
  name: 'text',
  slug: 'text',
  Slogan: 'text',
});
BrandSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
});
BrandSchema.pre(['updateOne', 'findOneAndUpdate'], async function () {
  const update = this.getUpdate() as BrandDocument;
  if (update.name) {
    this.set({ slug: slugify(update.name) });
  }
});
BrandSchema.post('findOneAndDelete', async function (doc: BrandDocument) {
  const s3 = new s3_services();
  if (doc && doc.logo) await s3.deleteFile(doc.logo);
});
export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: BrandSchema },
]);
