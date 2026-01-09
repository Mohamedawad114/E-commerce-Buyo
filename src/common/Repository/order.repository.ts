import { Model, Types } from 'mongoose';
import { BaseRepository } from './Base.repository';
import { Order, orderDocument } from 'src/DB';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { orderStatus } from '../Enums';
import dayjs from 'dayjs';

@Injectable()
export class Order_Repo extends BaseRepository<orderDocument> {
  constructor(
    @InjectModel(Order.name) protected orderModel: Model<orderDocument>,
  ) {
    super(orderModel);
  }
  async updateOrder(order: orderDocument): Promise<orderDocument> {
    return await order.save();
  }
  getUserOrders = async (userId: Types.ObjectId, page: number) => {
    const limit = 5;
    const skip = (page - 1) * limit;
    const orders = await this.orderModel.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            { $unwind: '$products' },
            {
              $lookup: {
                from: 'products',
                let: { productId: '$products.productId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$productId'] },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: 1,
                    },
                  },
                ],
                as: 'productData',
              },
            },
            { $unwind: '$productData' },
            {
              $group: {
                _id: '$_id',
                createdAt: { $first: '$createdAt' },
                final_price: { $first: '$final_price' },
                discount: { $first: '$discount' },
                status: { $first: '$status' },
                note: { $first: '$note' },
                address: { $first: '$address' },
                cancelReson: { $first: '$cancelReson' },
                paymentType: { $first: '$paymentType' },
                products: {
                  $push: {
                    productId: '$products.productId',
                    quantity: '$products.quantity',
                    price: '$products.price',
                    name: '$productData.name',
                  },
                },
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ]);
    return {
      data: {
        orders: orders[0]?.data || [],
      },
      meta: {
        total: orders[0]?.meta[0]?.total || 0,
        page,
        limit,
      },
    };
  };
  totalMoney = async (status: orderStatus, orderIds: Types.ObjectId[]) => {
    if (!orderIds.length) return { data: { total_income: 0 } };
    const result = await this.orderModel.aggregate([
      { $match: { status, _id: { $in: orderIds } } },
      {
        $group: {
          _id: null,
          total_income: { $sum: '$final_price' },
        },
      },
    ]);
    return {
      data: {
        total_income: result[0]?.total_income ?? 0,
      },
    };
  };

  totalMoney_perWeek = async () => {
    const startOfWeek = dayjs().startOf('week').toDate();
    const result = await this.orderModel.aggregate([
      {
        $match: { status: orderStatus.Paid, createdAt: { $gte: startOfWeek } },
      },
      {
        $group: {
          _id: null,
          total_income: { $sum: '$final_price' },
        },
      },
    ]);
    return {
      data: {
        total_income: result[0]?.total_income ?? 0,
      },
    };
  };
}
