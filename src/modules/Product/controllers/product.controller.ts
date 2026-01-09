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
import { Auth, Sys_Role } from 'src/common';
import { Product_Servcies } from '../product.service';
import { addProductDto, updateAttachmentDTo, UpdateProductDto } from '../Dto';
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('admin/product')
export class Product_Controller {
  constructor(private readonly productServices: Product_Servcies) {}
  @HttpCode(200)
  @Get('uploadImgs')
  getUrls() {
    return this.productServices.uploadImgs();
  }
    @HttpCode(200)
    @Get('/deActive-list')
    deActiveList(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ) {
      return this.productServices.deActiveProducts( page);
    }
  @Post('/addProduct')
  addProducts(@Body() Dto: addProductDto) {
    return this.productServices.addProduct(Dto);
  }
  @HttpCode(200)
  @Put('/:productId/update')
  updateProduct(
    @Param('productId') productId: Types.ObjectId,
    @Body() Dto: UpdateProductDto,
  ) {
    return this.productServices.updateProduct(Dto, productId);
  }
  @HttpCode(200)
  @Patch('/:id/update-Attachment')
  updateAttachments(
    @Body() Dto: updateAttachmentDTo,
    @Param('id') productId: Types.ObjectId,
  ) {
    return this.productServices.updateAttachment(Dto, productId);
  }
  @Auth(Sys_Role.admin)
  @HttpCode(200)
  @Delete('/:id')
  deleteProduct(@Param('id') productId: Types.ObjectId) {
    return this.productServices.deleteProduct(productId);
  }
  @HttpCode(200)
  @Patch('/deActive/:id')
  deActiveProduct(@Param('id') productId: Types.ObjectId) {
    return this.productServices.deActiveProduct(productId);
  }
  @HttpCode(200)
  @Patch('/active/:id')
  ActiveActive(@Param('id') productId: Types.ObjectId) {
    return this.productServices.ActiveProduct(productId);
  }
}
