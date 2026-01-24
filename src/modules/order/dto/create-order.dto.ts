import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';
import { IOrder, paymentType } from 'src/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto implements Partial<IOrder> {
  @ApiProperty({
    description: 'Delivery address of the order',
    minLength: 10,
    maxLength: 150,
    example: '123 Main Street, Cairo, Egypt',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 150)
  address: string;

  @ApiPropertyOptional({
    description: 'Phone number with country code',
    example: '+201234567890',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone number must be between 10 and 15 digits and can include +',
  })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Optional note for the order',
    minLength: 10,
    maxLength: 50,
    example: 'Please deliver after 5 PM',
  })
  @IsString()
  @IsOptional()
  @Length(10, 50)
  note: string;

  @ApiPropertyOptional({
    description: 'Coupon ID to apply for this order',
    type: String,
    example: '64e8f3c2a1b2c34567890123',
  })
  @IsMongoId()
  @IsOptional()
  coupon?: Types.ObjectId;

  @ApiProperty({
    description: 'Payment type for the order',
    enum: paymentType,
    example: paymentType.Card,
  })
  @IsEnum(paymentType)
  paymentType: paymentType;

  @ApiProperty({
    description: 'Security key for verification or checkout',
    example: 'a1b2c3d4e5f6',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
