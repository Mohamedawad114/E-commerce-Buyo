import { IsMongoId, IsNumber, IsPositive, Min } from 'class-validator';
import { Types } from 'mongoose';
import { ICartProduct } from 'src/common';
import { ApiProperty } from '@nestjs/swagger';

export class addToCartDto implements ICartProduct {
  @ApiProperty({
    description: 'ID of the product to add to cart',
    example: '64e9a2f9a3c4b1234567890a',
  })
  @IsMongoId()
  productId: Types.ObjectId;

  @ApiProperty({
    description: 'Quantity of the product to add',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
