import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Min,
  MinDate,
} from 'class-validator';
import { CouponType, ICoupon } from 'src/common';

export class CreateCouponDto implements Partial<ICoupon> {
  @IsString()
  @IsNotEmpty()
  @Length(3, 13)
  name: string;
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;
  @IsNumber()
  @IsPositive()
  @Min(1)
  limit: number;
  @IsEnum(CouponType)
  type: CouponType;
  @IsNumber()
  @IsPositive()
  value: number;
}
