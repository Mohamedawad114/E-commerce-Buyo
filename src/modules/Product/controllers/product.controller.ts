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
import { Types } from 'mongoose';
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
import { Product_Servcies } from '../product.service';
import { addProductDto, updateAttachmentDTo, UpdateProductDto } from '../Dto';

@ApiTags('Product')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/product')
export class Product_Controller {
  constructor(private readonly productServices: Product_Servcies) {}

  @HttpCode(200)
  @Get('uploadImgs')
  @ApiOperation({ summary: 'Get presigned URLs to upload product images' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URLs returned successfully',
  })
  getUrls() {
    return this.productServices.uploadImgs();
  }

  @HttpCode(200)
  @Get('/deActive-list')
  @ApiOperation({ summary: 'Get all deactivated products with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Deactivated products fetched successfully',
  })
  deActiveList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.productServices.deActiveProducts(page);
  }

  @Post('/addProduct')
  @ApiOperation({ summary: 'Add a new product' })
  @ApiBody({ type: addProductDto })
  @ApiResponse({ status: 201, description: 'Product added successfully' })
  addProducts(@Body() dto: addProductDto) {
    return this.productServices.addProduct(dto);
  }

  @HttpCode(200)
  @Put('/:productId/update')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({
    name: 'productId',
    type: String,
    description: 'Product ObjectId',
  })
  @ApiBody({ type: UpdateProductDto })
  updateProduct(
    @Param('productId') productId: Types.ObjectId,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productServices.updateProduct(dto, productId);
  }

  @HttpCode(200)
  @Patch('/:id/update-Attachment')
  @ApiOperation({ summary: 'Update attachments for a product' })
  @ApiParam({ name: 'id', type: String, description: 'Product ObjectId' })
  @ApiBody({ type: updateAttachmentDTo })
  updateAttachments(
    @Body() dto: updateAttachmentDTo,
    @Param('id') productId: Types.ObjectId,
  ) {
    return this.productServices.updateAttachment(dto, productId);
  }

  @Auth(Sys_Role.admin)
  @HttpCode(200)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete product by ID (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Product ObjectId' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  deleteProduct(@Param('id') productId: Types.ObjectId) {
    return this.productServices.deleteProduct(productId);
  }

  @HttpCode(200)
  @Patch('/deActive/:id')
  @ApiOperation({ summary: 'Deactivate product by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Product ObjectId' })
  deActiveProduct(@Param('id') productId: Types.ObjectId) {
    return this.productServices.deActiveProduct(productId);
  }

  @HttpCode(200)
  @Patch('/active/:id')
  @ApiOperation({ summary: 'Activate product by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Product ObjectId' })
  ActiveActive(@Param('id') productId: Types.ObjectId) {
    return this.productServices.ActiveProduct(productId);
  }
}
