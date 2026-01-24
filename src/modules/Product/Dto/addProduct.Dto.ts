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
} from 'class-validator';
import { Types } from 'mongoose';
import { IProduct } from 'src/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class addProductDto implements IProduct {
  @ApiProperty({
    example: 'iPhone 14 Pro',
    description: 'Product name',
    minLength: 4,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 64)
  name: string;

  @ApiProperty({
    example: 'Latest Apple iPhone 14 Pro with advanced camera features',
    description: 'Product description',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  descripation: string;

  @ApiProperty({
    example: ['https://bucket.com/img1.png', 'https://bucket.com/img2.png'],
    description: 'Array of product image URLs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  productImgs: string[];

  @ApiProperty({
    example: 50,
    description: 'Number of items in stock',
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  stock: number;

  @ApiProperty({
    example: 1200,
    description: 'Original price of the product',
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  originalprice: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Discount percentage, max 40%',
    maximum: 40,
  })
  @IsNumber()
  @IsOptional()
  @Max(40)
  discountPercent?: number;

  @ApiProperty({
    example: '63f3c9a8b9f1c22d4b7e2f3a',
    description: 'Category ObjectId',
  })
  @IsNotEmpty()
  @IsMongoId()
  CategoryId: Types.ObjectId;

  @ApiProperty({
    example: '63f3c9a8b9f1c22d4b7e2f3b',
    description: 'Brand ObjectId',
  })
  @IsNotEmpty()
  @IsMongoId()
  BrandId: Types.ObjectId;
}
