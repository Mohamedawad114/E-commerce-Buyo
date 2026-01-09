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
import { Auth, Sys_Role } from 'src/common';
import { Category_Services } from '../category.service';
import { Types } from 'mongoose';
import { categoryIdDto, CreateCategoryDto, updateCategoryDto } from '../Dto';

@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/category')
export class Category {
  constructor(private readonly categoryServices: Category_Services) {}
  @HttpCode(200)
  @Get('/upload-pic')
  getUrl() {
    return this.categoryServices.uploadImg();
  }
  @HttpCode(200)
  @Get('/deActive-list')
  allDeActiveCategories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.categoryServices.allDeActiceCategories(page);
  }

  @Post('/create')
  craeteCategory(@Body() Dto: CreateCategoryDto) {
    return this.categoryServices.addCategory(Dto);
  }
  @HttpCode(200)
  @Put('/update/:id')
  updateCategory(
    @Param('id') CategoryId: Types.ObjectId,
    @Body() Dto: updateCategoryDto,
  ) {
    return this.categoryServices.updateCategory(Dto, CategoryId);
  }
  @Auth(Sys_Role.admin)
  @HttpCode(200)
  @Delete('/delete/:id')
  deleteCategory(@Param('id') CategoryId: Types.ObjectId) {
    return this.categoryServices.deleteCategory(CategoryId);
  }
  @HttpCode(200)
  @Patch('/deActive/:id')
  deActiveCategory(@Param('id') CategoryId: Types.ObjectId) {
    return this.categoryServices.deActiveCategory(CategoryId);
  }
  @HttpCode(200)
  @Patch('/active/:id')
  ActiveCategory(@Param('id') CategoryId: Types.ObjectId) {
    return this.categoryServices.ActiveCategory(CategoryId);
  }
}
