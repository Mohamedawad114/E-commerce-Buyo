import { calcSalePrice } from './calcSalePrice.function';
import { NewRateAvg, NewRateAvgAfterDelete } from './rateAvg.functions';

describe('calcSalePrice (product)', () => {
  it('should calculate sale price with 10% discount', () => {
    const discountPercent = 10,
      originalPrice = 200;
    const result = calcSalePrice(originalPrice, discountPercent);
    expect(result).toBe(180);
  });
  it('should calculate sale price with 40% discount', () => {
    const discountPercent = 40,
      originalPrice = 200;
    const result = calcSalePrice(originalPrice, discountPercent);
    expect(result).toBe(120);
  });
  it('should calculate sale price equal 0', () => {
    const discountPercent = 40,
      originalPrice = 0;
    const result = calcSalePrice(originalPrice, discountPercent);
    expect(result).toBe(0);
  });
}),
  describe('Rate Utils', () => {
    describe('NewRateAvg', () => {
      it('should calculate new average when adding first review', () => {
        const product: any = {
          rateAvg: 0,
          reviewsNumber: 0,
        };
        const dto: any = {
          stars: 5,
        };
        const result = NewRateAvg(product, dto);
        expect(result).toBe(5);
      });
      it('should calculate correct new average with existing reviews', () => {
        const product: any = {
          rateAvg: 4,
          reviewsNumber: 2,
        };
        const dto: any = {
          stars: 5,
        };
        // (4 * 2 + 5) / 3 = 13 / 3
        const result = NewRateAvg(product, dto);
        expect(result).toBeCloseTo(4.33, 2);
      });
    });
    describe('NewRateAvgAfterDelete', () => {
      it('should recalculate average when reviewsNumber > 1', () => {
        const product: any = {
          rateAvg: 4,
          reviewsNumber: 3,
        };
        const review: any = {
          stars: 5,
        };
        // (4 * 3 - 5) / 2 = 7 / 2
        const result = NewRateAvgAfterDelete(review, product);
        expect(result).toBe(3.5);
      });
      it('should return 0 when deleting the last review', () => {
        const product: any = {
          rateAvg: 5,
          reviewsNumber: 1,
        };
        const review: any = {
          stars: 5,
        };
        const result = NewRateAvgAfterDelete(review, product);
        expect(result).toBe(0);
      });
    });
  });
