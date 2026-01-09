import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';
import { IOrder, paymentType } from 'src/common';

export class CreateOrderDto implements Partial<IOrder> {
  @IsString()
  @IsNotEmpty()
  @Length(10, 150)
  address: string;
  @IsString()
  @IsOptional()
  phoneNumber: string;
  @IsString()
  @IsOptional()
  @Length(10, 50)
  note: string;
  @IsMongoId()
  @IsOptional()
  coupon?: Types.ObjectId;
  @IsEnum(paymentType)
  paymentType: paymentType;
  @IsString()
  @IsNotEmpty()
  key: string;
}
