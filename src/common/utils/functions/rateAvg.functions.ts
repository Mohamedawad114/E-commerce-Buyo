import { ProductDocument, ReviewDocument } from 'src/DB';
import { addReviewDto } from 'src/modules/reviews/Dto';

export function NewRateAvg(product: ProductDocument, Dto: addReviewDto) {
 return (product?.rateAvg * product?.reviewsNumber + Dto.stars) /
    (product.reviewsNumber + 1);
}
export function NewRateAvgAfterDelete(review: ReviewDocument,product: ProductDocument,) {
  return product.reviewsNumber > 1
    ? (product.rateAvg * product.reviewsNumber - review.stars) /
    (product.reviewsNumber - 1)
    : 0;
}