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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { Product_Servcies } from '../product.service';
import { CategoryProductDto, SearchDto } from '../Dto';

@ApiTags('Product')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.admin, Sys_Role.moderator, Sys_Role.user)
@Controller('Products')
export class ProductUser_Controller {
  constructor(private readonly productServices: Product_Servcies) {}
  @HttpCode(200)
  @Get('/:categoryId/products')
  @ApiOperation({ summary: 'Get products by category with pagination' })
  @ApiParam({
    name: 'categoryId',
    type: String,
    description: 'Category ObjectId',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Sort order (asc, desc)',
  })
  getCategoryProducts(
    @Param() dto: CategoryProductDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('sort') sort: string,
  ) {
    return this.productServices.categotyProducts(dto, page, sort);
  }

  @HttpCode(200)
  @Get('/:id')
  @ApiOperation({ summary: 'Get single product by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Product ObjectId' })
  @ApiResponse({ status: 200, description: 'Product fetched successfully' })
  getProduct(@Param('id') productId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.productServices.getProduct(productId, user);
  }

  @HttpCode(200)
  @Get('/:categoryId/:brandId')
  @ApiOperation({
    summary: 'Get products by category and brand with pagination',
  })
  @ApiParam({
    name: 'categoryId',
    type: String,
    description: 'Category ObjectId',
  })
  @ApiParam({ name: 'brandId', type: String, description: 'Brand ObjectId' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Sort order (asc, desc)',
  })
  productsSpecCategoryBrand(
    @Param('categoryId') categoryId: Types.ObjectId,
    @Param('brandId') brandId: Types.ObjectId,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('sort') sort: string,
  ) {
    return this.productServices.products_spec_category_brand(
      categoryId,
      brandId,
      page,
      sort,
    );
  }

  @HttpCode(200)
  @Get('/')
  @ApiOperation({ summary: 'Search products with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Products filtered successfully' })
  searchProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query() search: SearchDto,
  ) {
    return this.productServices.searchProducts(search, page);
  }
}
