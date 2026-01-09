import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth, Sys_Role } from 'src/common';
import { Dashboard_product_services } from '../services/dashborad.products.service';
import { Types } from 'mongoose';

@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('Dashboard/product')
export class Dashboard_product_Controller {
  constructor(
    private readonly adminProductService: Dashboard_product_services,
  ) {}

  @Get('top-products')
  topSelling_products(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminProductService.topSelling_products(page);
  }
  @Get('top-rating')
  topRating_product(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminProductService.topRating_products(page);
  }
  @Get(':id/top-products')
  topProducts_category(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Param('id') categoryId: Types.ObjectId,
  ) {
    return this.adminProductService.topselling_products_forCategory(
      categoryId,
      page,
    );
  }
  @Get(':id/top-rateing')
  topRating_category(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Param('id') categoryId: Types.ObjectId,
  ) {
    return this.adminProductService.topRating_products_forCategory(
      categoryId,
      page,
    );
  }

  @Get('low-stock')
  lackProducts_stock(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminProductService.lowStock_alert(page);
  }
}
