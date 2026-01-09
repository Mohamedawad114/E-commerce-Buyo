import { Types } from "mongoose";
import { CreateCategoryDto } from "./addCategory.Dto";
import{ PartialType } from '@nestjs/mapped-types'
import { IsArray, IsMongoId, IsOptional } from "class-validator";

export class updateCategoryDto extends PartialType(CreateCategoryDto) {
      @IsArray()
      @IsMongoId({ each: true })
      @IsOptional()
    removedBrandIds:Types.ObjectId[]
}