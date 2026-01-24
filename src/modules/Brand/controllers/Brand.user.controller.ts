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
import { searchDto } from '../Dto';
import { Types } from 'mongoose';
import { BrandSerivces } from '../Brand.service';

@ApiTags('Brand')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.user, Sys_Role.admin, Sys_Role.moderator)
@Controller('Brands')
export class BrandUser_Controller {
  constructor(private readonly BrandServices: BrandSerivces) {}

  @HttpCode(200)
  @Get('/list')
  @ApiOperation({ summary: 'Get all brands with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'All brands fetched successfully' })
  getBrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.BrandServices.getAllBrands(page);
  }

  @HttpCode(200)
  @Get('/search')
  @ApiOperation({ summary: 'Search brands with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Brand name to search',
  })
  @ApiResponse({ status: 200, description: 'Brands filtered successfully' })
  searchBrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query() search: searchDto,
  ) {
    return this.BrandServices.searchBrands(page, search);
  }

  @HttpCode(200)
  @Get('/:BrandId')
  @ApiOperation({ summary: 'Get single brand by ID' })
  @ApiParam({ name: 'BrandId', type: String, description: 'Brand ObjectId' })
  @ApiResponse({ status: 200, description: 'Brand fetched successfully' })
  getBrand(@Param('BrandId') BrandId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.BrandServices.getBrand(BrandId, user);
  }
}
