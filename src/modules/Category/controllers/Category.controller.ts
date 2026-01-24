import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Auth, Sys_Role } from 'src/common';
import { Category_Services } from '../category.service';
import { Types } from 'mongoose';
import {  CreateCategoryDto, updateCategoryDto } from '../Dto';

@ApiTags('Category')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/category')
export class Category_Controller {
  constructor(private readonly categoryServices: Category_Services) {}

  @HttpCode(200)
  @Get('/upload-pic')
  @ApiOperation({ summary: 'Get upload URL for category image' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
  })
  getUrl() {
    return this.categoryServices.uploadImg();
  }

  @HttpCode(200)
  @Get('/deActive-list')
  @ApiOperation({ summary: 'List all deactivated categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  allDeActiveCategories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.categoryServices.allDeActiceCategories(page);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Create new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  craeteCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryServices.addCategory(dto);
  }

  @HttpCode(200)
  @Put('/update/:id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Category ObjectId' })
  @ApiBody({ type: updateCategoryDto })
  updateCategory(
    @Param('id') CategoryId: Types.ObjectId,
    @Body() dto: updateCategoryDto,
  ) {
    return this.categoryServices.updateCategory(dto, CategoryId);
  }

  @Auth(Sys_Role.admin)
  @HttpCode(200)
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete category by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Category ObjectId' })
  deleteCategory(@Param('id') CategoryId: Types.ObjectId) {
    return this.categoryServices.deleteCategory(CategoryId);
  }

  @HttpCode(200)
  @Patch('/deActive/:id')
  @ApiOperation({ summary: 'Deactivate category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Category ObjectId' })
  deActiveCategory(@Param('id') CategoryId: Types.ObjectId) {
    return this.categoryServices.deActiveCategory(CategoryId);
  }

  @HttpCode(200)
  @Patch('/active/:id')
  @ApiOperation({ summary: 'Activate category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Category ObjectId' })
  ActiveCategory(@Param('id') CategoryId: Types.ObjectId) {
    return this.categoryServices.ActiveCategory(CategoryId);
  }
}
