import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class CategoryProductDto{
    @IsNotEmpty()
    @IsMongoId()
    categoryId:Types.ObjectId
}
export class Category_Brand_ProductDto{
    @IsNotEmpty()
    @IsMongoId()
    categoryId:Types.ObjectId
    @IsNotEmpty()
    @IsMongoId()
    brandId:Types.ObjectId
}
export class SearchDto{
    @IsString()
    search:string
}