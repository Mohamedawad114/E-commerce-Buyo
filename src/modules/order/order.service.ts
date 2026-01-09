import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { cancelOrderDto, CreateOrderDto } from './dto';
import {
  Cart_Repo,
  Coupon_Repo,
  CouponStatus,
  CouponType,
  Crypto,
  getSecondsUntilEndOfDay,
  IorderProduct,
  IUser,
  Order_Repo,
  orderStatus,
  productRepo,
  redis,
} from 'src/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class OrderService {
  constructor(
    private readonly cartRepo: Cart_Repo,
    private readonly OrderRepo: Order_Repo,
    private readonly couponRepo: Coupon_Repo,
    private readonly productRepo: productRepo,
    private readonly crypto: Crypto,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(Dto: CreateOrderDto, user: IUser) {
    if (!Dto.key) throw new BadRequestException('idempotency key is requires');
    if (await redis.get(`key_createOrder:${Dto.key}`))
      throw new ConflictException('create order in proceess');
    await redis.set(`key_createOrder:${Dto.key}`, Dto.key, 'EX', 5 * 60);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const cart = await this.cartRepo.findOneDocument(
        { userId: user._id },
        {},
        { session },
      );
      if (!cart?.products?.length || !cart)
        throw new NotFoundException('please select products first ');
      let coupon: any;
      let discount = 0;
      if (Dto.coupon) {
        coupon = await this.couponRepo.findOneDocument(
          {
            _id: Dto.coupon,
            status: CouponStatus.active,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
          },
          {},
          { session },
        );
        if (!coupon) throw new NotFoundException('coupon not found');
        if (coupon.users.length >= coupon.limit)
          throw new BadRequestException('coupon out of limitaion');
        if (coupon.users.some((id) => id.equals(user._id)))
          throw new ConflictException("can't use coupon twice");
        await this.couponRepo.updateDocument(
          { _id: Dto.coupon },
          { $push: { users: user._id } },
          { session },
        );
      }
      const products: IorderProduct[] = await Promise.all(
        cart.products.map(async (P) => {
          const product = await this.productRepo.findOneDocument(
            { _id: P.productId, stock: { $gte: P.quantity }, isActive: true },
            {},
            { session },
          );
          if (!product)
            throw new NotFoundException(
              ` Product not found or stock is out of quantity`,
            );
          product.stock = product.stock - P.quantity;
          product.sold += P.quantity;
          await product.save({ session });
          return {
            productId: product._id,
            quantity: P.quantity,
            price: product.saleprice,
          };
        }),
      );
      const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
      let discountAmount = 0;
      if (coupon) {
        if (coupon.type === CouponType.percent) discount = coupon.value / 100;
        else discountAmount = coupon.value;
      }
      delete Dto.coupon;
      const order = await this.OrderRepo.createDocument(
        {
          ...Dto,
          phoneNumber: this.crypto.encryption(Dto.phoneNumber),
          subTotal: total,
          userId: user._id,
          coupon: coupon?._id,
          discount: discount,
          discountAmount: discountAmount,
          products: products,
          orderId: randomUUID().slice(0, 8),
        },
        { session },
      );
      cart.products = [];
      await cart.save({ session });
      const secondsLeft = getSecondsUntilEndOfDay();
      await redis.sadd(`pending_orders`, order._id.toString());
      await redis.expire(`pending_orders`, secondsLeft);
      await redis.expire(`paid_orders`, secondsLeft);
      await session.commitTransaction();
      return { message: 'order created', data: { order } };
    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
        throw err;
      }
    } finally {
      session.endSession();
    }
  }

  async cancelOrder(Dto: cancelOrderDto, user: IUser, orderId: Types.ObjectId) {
    if (!Dto.key) throw new BadRequestException('idempotency key is requires');
    if (await redis.get(`key_cancelOrder:${Dto.key}`))
      throw new ConflictException('cancel order in proceess');
    await redis.set(`key_cancelOrder:${Dto.key}`, Dto.key, 'EX', 60 * 5);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const order = await this.OrderRepo.findOneDocumentAndUpdate(
      {
        _id: orderId,
        userId: user._id,
        status: orderStatus.Paid,
        paidAt: { $gte: threeDaysAgo },
      },
      {
        cancelReson: Dto.cancelReson,
      },
    );
    if (!order)
      throw new NotFoundException(
        'order not found or your paid for this order more than 3 days ',
      );
    const secondsLeft = getSecondsUntilEndOfDay();
    await redis.sadd(`cancel_orders`, order._id.toString());
    await redis.expire(`cancel_orders`, secondsLeft);
    return { message: 'your request under review' };
  }

  async getOrders(user: IUser, page: number) {
    const orders = await this.OrderRepo.getUserOrders(user._id, page);
    if (!orders) throw new NotFoundException('no orders yet');
    return orders;
  }

  async getOrder(orderId: Types.ObjectId, user: IUser) {
    const order = await this.OrderRepo.findOneDocument(
      { $or: [{ orderId: orderId }, { _id: orderId }], userId: user._id },
      {},
      { populate: { path: 'products.productId', select: 'name' } },
    );
    if (!order) throw new NotFoundException(' order  not found');
    return { data: { order } };
  }
}
