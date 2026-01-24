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
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Dashboard Products')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('Dashboard/product')
export class Dashboard_product_Controller {
  constructor(
    private readonly adminProductService: Dashboard_product_services,
  ) {}

  @ApiOperation({ summary: 'Get top selling products (all)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('top-products')
  topSelling_products(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminProductService.topSelling_products(page);
  }

  @ApiOperation({ summary: 'Get top rated products (all)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('top-rating')
  topRating_product(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminProductService.topRating_products(page);
  }

  @ApiOperation({ summary: 'Get top selling products for a specific category' })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
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

  @ApiOperation({ summary: 'Get top rated products for a specific category' })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
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

  @ApiOperation({ summary: 'Get products with low stock alerts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('low-stock')
  lackProducts_stock(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.adminProductService.lowStock_alert(page);
  }
}
