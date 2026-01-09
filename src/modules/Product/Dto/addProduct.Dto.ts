import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { IProduct } from 'src/common';

export class addProductDto implements IProduct {
  @IsString()
  @IsNotEmpty()
  @Length(4, 64)
  name: string;
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  descripation: string;
  @IsArray()
  @IsString({ each: true })
  productImgs: string[];
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  stock: number;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  originalprice: number;
  @IsNumber()
  @IsOptional()
  @Max(40)
  discountPercent: number;
  @IsNotEmpty()
  @IsMongoId()
  CategoryId: Types.ObjectId;
  @IsNotEmpty()
  @IsMongoId()
  BrandId: Types.ObjectId;
}
