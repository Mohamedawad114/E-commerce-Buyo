import { Module } from '@nestjs/common';
import {
  Brand_Repo,
  Category_Repo,
  commonModule,
  productRepo,
  s3_services,
} from 'src/common';
import { BrandModel, categoryModel, ProductModel } from 'src/DB';
import { Category, categoryUser_controller } from './controllers';
import { Category_Services } from './category.service';

@Module({
  imports: [categoryModel, commonModule, BrandModel,ProductModel],
  providers: [Category_Repo, s3_services, Category_Services, Brand_Repo,productRepo],
  controllers: [Category, categoryUser_controller],
})
export class CategoryModule {}
