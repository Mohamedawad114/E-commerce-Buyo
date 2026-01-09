import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { Category_Services } from '../category.service';
import { categoryIdDto } from '../Dto';
import { searchDto } from 'src/modules/Brand/Dto';

@Auth(Sys_Role.user, Sys_Role.admin, Sys_Role.moderator)
@Controller('category')
export class categoryUser_controller {
  constructor(private readonly categoryServices: Category_Services) {}
  @HttpCode(200)
  @Get('/:CategoryId')
  getCategory(
    @Param() CategoryId: categoryIdDto,
    @AuthUser() user: IUser,
  ) {
    return this.categoryServices.getCategory(CategoryId, user);
  }
  @HttpCode(200)
  @Get('/')
  searchBrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query() search: searchDto,
  ) {
    return this.categoryServices.searchCategories(page, search);
  }
  @HttpCode(200)
  @Get('/')
  getCAtegories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.categoryServices.allCategories(page);
  }
}
