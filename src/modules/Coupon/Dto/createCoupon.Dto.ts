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
} from 'class-validator';
import { CouponType, ICoupon } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto implements Partial<ICoupon> {
  @ApiProperty({
    description: 'Coupon name',
    example: 'NEWYEAR2026',
    minLength: 3,
    maxLength: 13,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 13)
  name: string;

  @ApiProperty({
    description: 'Start date of the coupon',
    example: '2026-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the coupon',
    example: '2026-01-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'Maximum number of uses for this coupon',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  limit: number;

  @ApiProperty({
    description: 'Type of the coupon (Percentage or Fixed amount)',
    enum: CouponType,
    example: CouponType.percent,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    description: 'Value of the coupon (percentage or fixed amount)',
    example: 20,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  value: number;
}
