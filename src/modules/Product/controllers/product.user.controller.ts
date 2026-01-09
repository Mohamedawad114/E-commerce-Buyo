import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { Product_Servcies } from '../product.service';
import { CategoryProductDto, SearchDto } from '../Dto';
@Auth(Sys_Role.admin, Sys_Role.moderator, Sys_Role.user)
@Controller('Products')
export class Product_User_Controller {
  @HttpCode(200)
  @Get('/:categoryId/products')
  getCategoryProducts(
    @Param() Dto: CategoryProductDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('sort') Sort: string,
  ) {
    return this.productServices.categotyProducts(Dto, page, Sort);
  }
  constructor(private readonly productServices: Product_Servcies) {}
  @HttpCode(200)
  @Get('/:id')
  getProduct(@Param('id') productId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.productServices.getProduct(productId, user);
  }
  @HttpCode(200)
  @Get(':categoryId/:brandId')
  products_spec_category_brand(
    @Param('brandId') brandId: Types.ObjectId,
    @Param('categoryId') categoryId: Types.ObjectId,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('sort') Sort: string,
  ) {
    return this.productServices.products_spec_category_brand(
      categoryId,
      brandId,
      page,
      Sort,
    );
  }
  @HttpCode(200)
  @Get('/')
  searchProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query() search: SearchDto,
  ) {
    return this.productServices.searchProducts(search, page);
  }
}
