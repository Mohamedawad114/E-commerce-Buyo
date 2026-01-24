import { Types } from 'mongoose';
import { CreateCategoryDto } from './addCategory.Dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class updateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    type: [String],
    description: 'Array of Brand ObjectIds to remove from this category',
    example: ['63f1c4a1b1a5c3f2d4e5f6a', '63f1c4a1b1a5c3f2d4e5f6b'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  removedBrandIds?: Types.ObjectId[];
}
