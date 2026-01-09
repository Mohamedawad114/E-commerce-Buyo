import { Review, type ReviewDocument } from 'src/DB';
import { BaseRepository } from './Base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewRepo extends BaseRepository<ReviewDocument> {
  constructor(@InjectModel(Review.name) reviewModel: Model<ReviewDocument>) {
    super(reviewModel);
  }
}
