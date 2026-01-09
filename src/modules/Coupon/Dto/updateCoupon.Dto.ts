import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CouponType, ICoupon } from 'src/common';

export class UpdateCouponDto implements Partial<ICoupon> {
  @IsString()
  @IsOptional()
  @Length(3,13)
  name: string;
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Min(1)
  limit: number;
  @IsOptional()
  @IsEnum(CouponType)
  type: CouponType;
  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => o.type === CouponType.percent)
  @Max(40)
  value: number;
}
