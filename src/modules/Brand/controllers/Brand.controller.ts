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
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { BrandSerivces } from '../Brand.service';
import { Types } from 'mongoose';
import { createBrandDto, updateBrandDto } from '../Dto';

@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/Brands')
export class Brand_controller {
  constructor(private readonly BrandServices: BrandSerivces) {}
  @HttpCode(200)
  @Get('/upload-logo')
  getUrl() {
    return this.BrandServices.uploadLogo();
  }
  @HttpCode(200)
  @Get('/deActive-brands')
  allDeActivebrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.BrandServices.allDeActiceBrands(page);
  }

  @Post('/craete-Brand')
  craeteBrand(@AuthUser() user: IUser, @Body() Dto: createBrandDto) {
    const userId = user._id;
    return this.BrandServices.createBrand(Dto, userId);
  }
  @HttpCode(200)
  @Put('/update/:id')
  updateBrand(
    @Param('id') BrandId: Types.ObjectId,
    @Body() Dto: updateBrandDto,
  ) {
    return this.BrandServices.updateBrand(Dto, BrandId);
  }
  @HttpCode(200)
  @Patch('/deActive/:id')
  deActiveBrand(@Param('id') brandId: Types.ObjectId) {
    return this.BrandServices.deActiveBrand(brandId);
  }
  @HttpCode(200)
  @Patch('/active/:id')
  ActiveBrand(@Param('id') brandId: Types.ObjectId) {
    return this.BrandServices.ActiveBrand(brandId);
  }
}
