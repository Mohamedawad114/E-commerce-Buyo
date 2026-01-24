import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { Category_Services } from '../category.service';
import { categoryIdDto } from '../Dto';
import { searchDto } from 'src/modules/Brand/Dto';

@ApiTags('Category')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.user, Sys_Role.admin, Sys_Role.moderator)
@Controller('category')
export class CategoryUser_Controller {
  constructor(private readonly categoryServices: Category_Services) {}

  @HttpCode(200)
  @Get('/:CategoryId')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiParam({
    name: 'CategoryId',
    type: String,
    description: 'Category ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Category fetched successfully' })
  getCategory(@Param() CategoryId: categoryIdDto, @AuthUser() user: IUser) {
    return this.categoryServices.getCategory(CategoryId, user);
  }

  @HttpCode(200)
  @Get('/search')
  @ApiOperation({ summary: 'Search categories with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Category name to search',
  })
  @ApiResponse({ status: 200, description: 'Categories filtered successfully' })
  searchBrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query() search: searchDto,
  ) {
    return this.categoryServices.searchCategories(page, search);
  }

  @HttpCode(200)
  @Get('/')
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'All categories fetched successfully',
  })
  getCategories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.categoryServices.allCategories(page);
  }
}
