import { Module } from '@nestjs/common';
import { commonModule, productRepo, ReviewRepo } from 'src/common';
import { ProductModel, reviewModel } from 'src/DB';
import { Review_Services } from './review.service';
import { Review_Controller } from './review.controller';

@Module({
  imports: [reviewModel, commonModule, ProductModel],
  providers: [ReviewRepo, productRepo, Review_Services],
  controllers: [Review_Controller],
})
export class ReviewModule {}
