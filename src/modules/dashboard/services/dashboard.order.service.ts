import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Connection, Types } from 'mongoose';
import {
  Crypto,
  IOrder,
  notificationHandler,
  NotificationRepo,
  Order_Repo,
  orderStatus,
  redis,
} from 'src/common';
import { realTimeGateway } from 'src/modules/Gateway/gateway';
import { StripeCheckoutStrategy } from 'src/modules/payment/strategies/stripe.strategy';

@Injectable()
export class Dashboard_order_service {
  constructor(
    private readonly orderRepo: Order_Repo,
    private readonly paymentService: StripeCheckoutStrategy,
    private readonly crypto: Crypto,
    private readonly realTimeGateway: realTimeGateway,
    private readonly notificationRepo: NotificationRepo,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  listDailyOrdersByStatus = async (filter: orderStatus, page: number) => {
    const limit = 20;
    const offset = (page - 1) * limit;
    let status: orderStatus;
    let cacheKey: string;
    switch (filter) {
      case orderStatus.Pending:
        ((status = orderStatus.Pending), (cacheKey = `pending_orders`));
        break;
      case orderStatus.Paid:
        ((status = orderStatus.Paid), (cacheKey = `paid_orders`));
        break;
      case orderStatus.Cancel:
        ((status = orderStatus.Paid), (cacheKey = `cancel_orders`));
        break;
      default:
        ((status = orderStatus.Paid), (cacheKey = `paid_orders`));
        break;
    }
    const orderIds = await redis.smembers(cacheKey);
    const ids = orderIds.map((id) => new Types.ObjectId(id));
    const [orders, count] = await Promise.all([
      this.orderRepo.findDocuments(
        {
          _id: { $in: ids },
          status: status,
        },
        {},
        {
          skip: offset,
          limit,
          sort: { createdAt: -1 },
          populate: { path: 'userId', select: 'username' },
        },
      ),
      this.orderRepo.countDocuments({
        _id: { $in: ids },
        status: status,
      }),
    ]);
    orders.forEach((order: IOrder) => {
      order.phoneNumber = this.crypto.decryption(order.phoneNumber);
    });
    const { data } = await this.orderRepo.totalMoney(status, ids);
    return {
      data: { orders, total_income: data.total_income },
      meta: {
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  };

  listWeekOrder = async (page: number) => {
    const startOfWeek = dayjs().startOf('week').toDate();
    const limit = 20;
    const offset = (page - 1) * limit;
    const [orders, count] = await Promise.all([
      this.orderRepo.findDocuments(
        {
          createdAt: { $gte: startOfWeek },
          status: orderStatus.Paid,
        },
        {},
        {
          skip: offset,
          limit,
          sort: { createdAt: -1 },
          populate: { path: 'userId', select: 'username' },
        },
      ),
      this.orderRepo.countDocuments({
        createdAt: { $gte: startOfWeek },
        status: orderStatus.Paid,
      }),
    ]);
    orders.forEach((order: IOrder) => {
      order.phoneNumber = this.crypto.decryption(order.phoneNumber);
    });
    const { data } = await this.orderRepo.totalMoney_perWeek();

    return {
      data: { orders, total_income: data.total_income },
      meta: {
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  };
  cancelOrder = async (orderId: Types.ObjectId, key: string) => {
    if (!key) throw new BadRequestException('key is required');
    if (await redis.get(`key_cancel:${key}`))
      throw new ConflictException('cancel in progess');
    await redis.set(`key_cancel:${key}`, key, 'EX', 60 * 5);
    console.log({
      orderId,
      isValid: Types.ObjectId.isValid(orderId),
    });
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const order = await this.orderRepo.findOneDocument(
        {
          _id: orderId,
          status: orderStatus.Paid,
        },
        {},
        { session },
      );
      if (!order) throw new NotFoundException('order not found');
      if (!order.paymentId)
        throw new BadRequestException('order not paid online');
      const diffInDays = dayjs().diff(order?.createdAt, 'day');
      if (diffInDays > 3)
        throw new BadRequestException('refund period expired');
      await this.paymentService.refund(order.paymentId, order.final_price);
      await this.orderRepo.updateDocument(
        { _id: orderId },
        { status: orderStatus.Cancel },
        { session },
      );
      await session.commitTransaction();
      session.endSession();
      const notification = await this.notificationRepo.createDocument({
        userId: order.userId,
        title: notificationHandler('order_paid', {
          orderId: order.orderId,
        }).title,
        content: notificationHandler('order_paid', {
          orderId: order.orderId,
        }).content,
      });
      this.realTimeGateway.sendNotification(order.userId, notification);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  };
}
