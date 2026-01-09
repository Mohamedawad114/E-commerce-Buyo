import { Model, Types } from 'mongoose';
import { BaseRepository } from './Base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Cart, CartDocument } from 'src/DB';

@Injectable()
export class Cart_Repo extends BaseRepository<CartDocument> {
  constructor(
    @InjectModel(Cart.name) protected cartModel: Model<CartDocument>,
  ) {
    super(cartModel);
  }
  async updateCart(Cart: CartDocument): Promise<CartDocument> {
    return await Cart.save();
  }
  calcTotalPrice = async (userId: Types.ObjectId) => {
    const result = await this.cartModel.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          foreignField: '_id',
          localField: 'products.productId',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: null,
          total_price: {
            $sum: {
              $multiply: ['$productData.saleprice', '$products.quantity'],
            },
          },
        },
      },
    ]);
    return result[0]?.total_price || 0;
  };
}
