import { Model } from 'mongoose';
import { BaseRepository } from './Base.repository';
import { Brand, BrandDocument } from 'src/DB';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Brand_Repo extends BaseRepository<BrandDocument> {
  constructor(
    @InjectModel(Brand.name) protected BrandModel: Model<BrandDocument>,
  ) {
    super(BrandModel);
  }
  async updateBrand(Brand: BrandDocument): Promise<BrandDocument> {
    return await Brand.save();
  }
}
