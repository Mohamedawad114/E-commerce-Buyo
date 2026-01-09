import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './Base.repository';
import { Category, CategoryDocument } from 'src/DB';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Category_Repo extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    protected CategoryModel: Model<CategoryDocument>,
  ) {
    super(CategoryModel);
  }
}
