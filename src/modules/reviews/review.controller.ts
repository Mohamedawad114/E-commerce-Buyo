import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Review_Services } from './review.service';
import { Types } from 'mongoose';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { addReviewDto } from './Dto';
@Auth(Sys_Role.admin, Sys_Role.user, Sys_Role.moderator)
@Controller('reviews')
export class Review_Controller {
  constructor(private readonly reviewServices: Review_Services) {}
  @Auth(Sys_Role.admin, Sys_Role.user, Sys_Role.moderator)
  @HttpCode(200)
  @Get('/:id')
  getReview(@Param('id') reviewId: Types.ObjectId) {
    return this.reviewServices.getReview(reviewId);
  }
  @HttpCode(200)
  @Get('products/:id')
  getProductReviews(
    @Param('id') productId: Types.ObjectId,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.reviewServices.getProductReviews(productId, page);
  }

  @Post('/:id/add-review')
  addReview(
    @Param('id') productId: Types.ObjectId,
    @AuthUser() user: IUser,
    @Body() Dto: addReviewDto,
  ) {
    return this.reviewServices.addReview(Dto, productId, user);
  }
  @HttpCode(200)
  @Delete('/:id/delete')
  deleteReview(@Param('id') reviewId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.reviewServices.deleteReview(reviewId, user);
  }
}
