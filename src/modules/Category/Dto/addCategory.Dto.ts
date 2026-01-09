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

export class CreateCategoryDto implements ICategory {
  @IsString()
  @IsNotEmpty()
  @Length(4, 64)
  name: string;

  @IsString()
  @IsOptional()
  @Length(10, 225)
  descripation: string;

  @IsString()
  @IsNotEmpty()
  CategoryImg: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  BrandIds: Types.ObjectId[];
}
export class categoryIdDto {
  @IsMongoId()
  CategoryId: Types.ObjectId | string;
}
