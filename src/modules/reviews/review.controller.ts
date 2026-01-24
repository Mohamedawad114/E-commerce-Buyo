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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Review_Services } from './review.service';
import { Types } from 'mongoose';
import { Auth, AuthUser, Sys_Role, type IUser } from 'src/common';
import { addReviewDto } from './Dto';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.admin, Sys_Role.user, Sys_Role.moderator)
@Controller('reviews')
export class Review_Controller {
  constructor(private readonly reviewServices: Review_Services) {}

  @HttpCode(200)
  @Get('/:id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Return review data' })
  getReview(@Param('id') reviewId: Types.ObjectId) {
    return this.reviewServices.getReview(reviewId);
  }

  @HttpCode(200)
  @Get('products/:id')
  @ApiOperation({ summary: 'Get reviews for a product with pagination' })
  @ApiResponse({ status: 200, description: 'Return list of reviews' })
  getProductReviews(
    @Param('id') productId: Types.ObjectId,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.reviewServices.getProductReviews(productId, page);
  }

  @Post('/:id/add-review')
  @ApiOperation({ summary: 'Add a review to a product' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  addReview(
    @Param('id') productId: Types.ObjectId,
    @AuthUser() user: IUser,
    @Body() Dto: addReviewDto,
  ) {
    return this.reviewServices.addReview(Dto, productId, user);
  }

  @HttpCode(200)
  @Delete('/:id/delete')
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  deleteReview(@Param('id') reviewId: Types.ObjectId, @AuthUser() user: IUser) {
    return this.reviewServices.deleteReview(reviewId, user);
  }
}
