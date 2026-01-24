import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type IUser,
  NewRateAvg,
  NewRateAvgAfterDelete,
  productRepo,
  ReviewRepo,
  Sys_Role,
} from 'src/common';
import { addReviewDto } from './Dto';
import { Types } from 'mongoose';

@Injectable()
export class Review_Services {
  constructor(
    private readonly reviewRepo: ReviewRepo,
    private readonly productRepo: productRepo,
  ) {}

  addReview = async (
    Dto: addReviewDto,
    productId: Types.ObjectId,
    user: IUser,
  ) => {
    const product = await this.productRepo.findByIdDocument(productId);
    if (!product) throw new NotFoundException('product not found');
    const create = await this.reviewRepo.createDocument({
      userId: user._id,
      productId,
      ...Dto,
    });
    if (create) {
      const newAvgRating = NewRateAvg(product, Dto);

      await this.productRepo.updateDocument(
        { _id: productId },
        { rateAvg: newAvgRating, $inc: { reviewsNumber: 1 } },
      );
      return { message: 'review shared', data: { create } };
    }
    return { message: 'something wrong' };
  };
  deleteReview = async (reviewId: Types.ObjectId, user: IUser) => {
    const review = await this.reviewRepo.findByIdDocument(reviewId);
    if (!review) throw new NotFoundException('review not found');
    if (
      user._id.toString() !== review.userId.toString() &&
      user.role === Sys_Role.user
    )
      throw new ForbiddenException();
    const deleted = await this.reviewRepo.deleteDocument({ _id: reviewId });
    if (deleted) {
      const product = await this.productRepo.findByIdDocument(review.productId);
      if (product) {
        const newAvgRating = NewRateAvgAfterDelete(review, product);
        await this.productRepo.updateDocument(
          { _id: review.productId },
          { rateAvg: newAvgRating, $inc: { reviewsNumber: -1 } },
        );
      }
      return { message: 'review deleted' };
    }
    return { message: 'something wrong' };
  };
  getReview = async (reviewId: Types.ObjectId) => {
    const review = await this.reviewRepo.findByIdDocument(
      reviewId,
      {},
      {
        populate: { path: 'userId', select: 'username profilePicture' },
      },
    );
    if (!review) throw new NotFoundException('review not found');
    return { message: 'review ', data: { review } };
  };
  getProductReviews = async (productId: Types.ObjectId, page: number) => {
    const product = await this.productRepo.findByIdDocument(productId);
    if (!product) throw new NotFoundException('product not found');
    const limit = 15;
    const offset = (page - 1) * limit;
    const reviews = await this.reviewRepo.findDocuments(
      { productId: productId },
      {},
      {
        limit,
        skip: offset,
        populate: { path: 'userId', select: 'username profilePicture' },
      },
    );
    return { message: 'product reviews ', data: { reviews } };
  };
}
