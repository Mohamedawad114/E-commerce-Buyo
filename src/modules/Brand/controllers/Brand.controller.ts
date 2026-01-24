import {
  Body,
  Controller,
  DefaultValuePipe,
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
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { BrandSerivces } from '../Brand.service';
import { Types } from 'mongoose';
import { createBrandDto, updateBrandDto } from '../Dto';

@ApiTags('Brand')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/Brands')
export class Brand_Controller {
  constructor(private readonly BrandServices: BrandSerivces) {}

  @HttpCode(200)
  @Get('/upload-logo')
  @ApiOperation({ summary: 'Get presigned URL to upload brand logo' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL returned successfully',
  })
  getUrl() {
    return this.BrandServices.uploadLogo();
  }

  @HttpCode(200)
  @Get('/deActive-brands')
  @ApiOperation({ summary: 'List all deactivated brands with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  allDeActivebrands(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.BrandServices.allDeActiceBrands(page);
  }

  @Post('/create-Brand')
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiBody({ type: createBrandDto })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  craeteBrand(@AuthUser() user: IUser, @Body() dto: createBrandDto) {
    const userId = user._id;
    return this.BrandServices.createBrand(dto, userId);
  }

  @HttpCode(200)
  @Put('/update/:id')
  @ApiOperation({ summary: 'Update brand by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Brand ObjectId' })
  @ApiBody({ type: updateBrandDto })
  updateBrand(
    @Param('id') BrandId: Types.ObjectId,
    @Body() dto: updateBrandDto,
  ) {
    return this.BrandServices.updateBrand(dto, BrandId);
  }

  @HttpCode(200)
  @Patch('/deActive/:id')
  @ApiOperation({ summary: 'Deactivate brand by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Brand ObjectId' })
  deActiveBrand(@Param('id') brandId: Types.ObjectId) {
    return this.BrandServices.deActiveBrand(brandId);
  }

  @HttpCode(200)
  @Patch('/active/:id')
  @ApiOperation({ summary: 'Activate brand by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Brand ObjectId' })
  ActiveBrand(@Param('id') brandId: Types.ObjectId) {
    return this.BrandServices.ActiveBrand(brandId);
  }
}
