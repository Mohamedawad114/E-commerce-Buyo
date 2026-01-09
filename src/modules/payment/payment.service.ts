import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StripeCheckoutStrategy } from './strategies/stripe.strategy';
import {
  CouponType,
  currency,
  EmailProducer,
  IUser,
  Order_Repo,
  orderStatus,
  paymentType,
  redis,
} from 'src/common';
import { Types } from 'mongoose';
import { couponDocument, ProductDocument, UserDocument } from 'src/DB';
import Stripe from 'stripe';
import { Request } from 'express';

@Injectable()
export class Payment_services {
  constructor(
    private readonly paymentStrategy: StripeCheckoutStrategy,
    private readonly orderRepo: Order_Repo,
    private readonly emailQueue: EmailProducer,
  ) {}
  async cheackout(orderId: Types.ObjectId, user: IUser, key: string) {
    if (!key) throw new BadRequestException('idempotency key is requires');
    if (await redis.get(`key_checkout:${key}`))
      throw new ConflictException('chekout in proceess');
    const order = await this.orderRepo.findOneDocument(
      {
        _id: orderId,
        userId: user._id,
        status: orderStatus.Pending,
        paymentType: paymentType.Card,
      },
      {},
      {
        populate: [
          { path: 'products.productId', select: 'name' },
          { path: 'coupon', select: 'type' },
        ],
      },
    );
    if (!order) throw new NotFoundException('order not found');
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.coupon) {
      const couponData: any = { duration: 'once', currency: 'egp' };
      if (
        (order.coupon as unknown as couponDocument).type === CouponType.percent
      )
        couponData.percent_off = order.discount * 100;
      else couponData.amount_off = order.discountAmount * 100;

      const Coupon = await this.paymentStrategy.createCoupon(couponData);
      discounts.push({ coupon: Coupon.id });
    }
    const session = await this.paymentStrategy.startPayment({
      customer_email: user.email,
      mode: 'payment',
      metadata: { orderId: order._id.toString() },
      discounts: discounts,
      line_items: order.products.map((p) => {
        return {
          quantity: p.quantity,
          price_data: {
            unit_amount: p.price * 100,
            currency: currency.egp,
            product_data: {
              name: (p.productId as unknown as ProductDocument).name,
            },
          },
        };
      }),
    });
    await redis.set(`key_checkout:${key}`, key, 'EX', 5 * 60);
    return {
      data: {
        url: session.url,
        Id: session.id,
        orderId: session?.metadata?.orderId,
      },
    };
  }
  async webhook(req: Request) {
    const event = await this.paymentStrategy.webhook(req);
    const { orderId } = event.data.object.metadata as {
      orderId: string;
    };
    const order = await this.orderRepo.findOneDocumentAndUpdate(
      {
        _id: Types.ObjectId.createFromHexString(orderId),
        status: orderStatus.Pending,
        paymentType: paymentType.Card,
      },
      {
        status: orderStatus.Paid,
        paidAt: new Date(),
        paymentId: event.data.object.payment_intent,
      },
      {
        populate: {
          path: 'userId',
          select: 'email',
        },
        new: true,
      },
    );
    if (!order) return { data: { ignored: true } };
    await redis.sadd(`paid_orders`, order._id.toString());
    await redis.srem(`pending_orders`, order._id.toString());
    await this.emailQueue.sendEmailJob(
      'orderPaid',
      (order.userId as unknown as UserDocument).email,
      order.orderId,
      order.paymentId,
      order.final_price,
    );
    return { datad: { received: true } };
  }
}
