import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(4, 64)
  name: string;
  @IsString()
  @IsOptional()
  @Length(10, 1000)
  descripation: string;
  @IsNumber()
  @IsOptional()
  @IsPositive()
  stock: number;
  @IsNumber()
  @IsOptional()
  @IsPositive()
  originalprice: number;
  @IsNumber()
  @IsOptional()
  @Max(40)
  discountPercent: number;
  @IsOptional()
  @IsMongoId()
  CategoryId: Types.ObjectId;
  @IsOptional()
  @IsMongoId()
  BrandId: Types.ObjectId;
}
