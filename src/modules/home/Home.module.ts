import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { Home_Services } from './home.service';
import { Dashboard_product_services } from '../dashboard/services';
import { Category_Repo, productRepo } from 'src/common';
import { categoryModel, ProductModel } from 'src/DB';

@Module({
  imports: [ProductModel,categoryModel],
  exports: [],
  providers: [Home_Services, Dashboard_product_services,productRepo,Category_Repo],
  controllers: [HomeController],
})
export class HomeModule {}
