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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'iPhone 14 Pro',
    description: 'Product name',
    minLength: 4,
    maxLength: 64,
  })
  @IsString()
  @IsOptional()
  @Length(4, 64)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated product description with more details',
    description: 'Product description',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @Length(10, 1000)
  descripation?: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Number of items in stock',
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  stock?: number;

  @ApiPropertyOptional({
    example: 1200,
    description: 'Original price of the product',
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  originalprice?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Discount percentage, max 40%',
    maximum: 40,
  })
  @IsNumber()
  @IsOptional()
  @Max(40)
  discountPercent?: number;

  @ApiPropertyOptional({
    example: '63f3c9a8b9f1c22d4b7e2f3a',
    description: 'Category ObjectId',
  })
  @IsOptional()
  @IsMongoId()
  CategoryId?: Types.ObjectId;

  @ApiPropertyOptional({
    example: '63f3c9a8b9f1c22d4b7e2f3b',
    description: 'Brand ObjectId',
  })
  @IsOptional()
  @IsMongoId()
  BrandId?: Types.ObjectId;
}
