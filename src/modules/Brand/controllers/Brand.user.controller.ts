import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth, AuthUser,type IUser, Sys_Role } from 'src/common';
import { searchDto } from '../Dto';
import { Types } from 'mongoose';
import { BrandSerivces } from '../Brand.service';

@Auth(Sys_Role.user, Sys_Role.admin, Sys_Role.moderator)
@Controller('Brands')
export class BrandUser_controller {
  @HttpCode(200)
  @Get('/list')
  getBrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.BrandServices.getAllBrands(page);
  }
  @HttpCode(200)
  @Get('/')
  searchBrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query() search: searchDto,
  ) {
    return this.BrandServices.searchBrands(page, search);
  }
  constructor(private readonly BrandServices: BrandSerivces) {}
  @HttpCode(200)
  @Get('/:BrandId')
  getBrand(@Param('BrandId') BrandId: Types.ObjectId,@AuthUser()user:IUser) {
    return this.BrandServices.getBrand(BrandId,user);
  }
}
