import { Types } from "mongoose";

export interface ICategory {
  name: string;
  descripation?: string;
  CategoryImg: string;
  ProductsNumber?: number;
  BrandIds?: Types.ObjectId[]
    DeActive?:boolean
}