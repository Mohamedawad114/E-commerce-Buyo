import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ICategory, s3_services } from 'src/common';

@Schema({ timestamps: true, autoIndex: false, strict: true })
export class Category implements ICategory {
  @Prop({
    type: String,
    required: true,
    minlength: 4,
    maxlength: 64,
    trim: true,
  })
  name: string;
  @Prop({
    type: String,
    required: false,
    trim: true,
    minlength: 10,
    maxlength: 225,
  })
  descripation: string;
  @Prop({ type: String, default: null, required: true })
  CategoryImg: string;
  @Prop({ type: Number, default: 0 })
  ProductsNumber: number;
  @Prop([{ type: Types.ObjectId, ref: 'Brand', required: false }])
  BrandIds: Types.ObjectId[];
  @Prop({ type: Boolean, default: false })
  DeActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index(
  { name: 1 },
  { unique: true, name: 'categoryName_unique' },
);
CategorySchema.index({
  name: 'text',
  descripation: 'text',
});
CategorySchema.post('findOneAndDelete', async function (doc: CategoryDocument) {
  const s3 = new s3_services();
  if (doc && doc.CategoryImg) await s3.deleteFile(doc.CategoryImg);
});
export type CategoryDocument = HydratedDocument<Category>;
export const categoryModel = MongooseModule.forFeature([
  {
    schema: CategorySchema,
    name: Category.name,
  },
]);
