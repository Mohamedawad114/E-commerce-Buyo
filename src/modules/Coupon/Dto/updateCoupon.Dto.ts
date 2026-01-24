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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCouponDto implements Partial<ICoupon> {
  @ApiPropertyOptional({
    description: 'Coupon name',
    example: 'NEWYEAR2026',
    minLength: 3,
    maxLength: 13,
  })
  @IsString()
  @IsOptional()
  @Length(3, 13)
  name: string;

  @ApiPropertyOptional({
    description: 'Maximum number of uses for this coupon',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Min(1)
  limit: number;

  @ApiPropertyOptional({
    description: 'Type of the coupon (Percentage or Fixed amount)',
    enum: CouponType,
    example: CouponType.percent,
  })
  @IsOptional()
  @IsEnum(CouponType)
  type: CouponType;

  @ApiPropertyOptional({
    description:
      'Value of the coupon (percentage or fixed amount). Max 40 if type is percentage',
    example: 20,
    maximum: 40,
  })
  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => o.type === CouponType.percent)
  @Max(40)
  value: number;
}
