import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';
import { ICategory } from 'src/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto implements ICategory {
  @ApiProperty({
    example: 'Electronics',
    description: 'Category name',
    minLength: 4,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 64)
  name: string;

  @ApiPropertyOptional({
    example: 'All electronic devices and accessories',
    description: 'Category description',
    minLength: 10,
    maxLength: 225,
  })
  @IsString()
  @IsOptional()
  @Length(10, 225)
  descripation?: string;

  @ApiProperty({
    example: 'https://mybucket.s3.amazonaws.com/category1.jpg',
    description: 'Category image URL',
  })
  @IsString()
  @IsNotEmpty()
  CategoryImg: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of Brand ObjectIds linked to this category',
    example: ['63f1c4a1b1a5c3f2d4e5f6a', '63f1c4a1b1a5c3f2d4e5f6b'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  BrandIds?: Types.ObjectId[];
}

export class categoryIdDto {
  @ApiProperty({
    example: '63f1c4a1b1a5c3f2d4e5f6a',
    description: 'Category ObjectId',
  })
  @IsMongoId()
  CategoryId: Types.ObjectId | string;
}
