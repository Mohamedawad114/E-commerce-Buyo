import { Product, ProductDocument } from 'src/DB';
import { BaseRepository } from './Base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class productRepo extends BaseRepository<ProductDocument> {
  constructor(@InjectModel(Product.name)protected productModel: Model<ProductDocument>) {
    super(productModel);
  }
  async updateProduct(product: ProductDocument): Promise<ProductDocument> {
    return await product.save();
  }
}
