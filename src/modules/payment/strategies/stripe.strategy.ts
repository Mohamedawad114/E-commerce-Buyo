import Stripe from 'stripe';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Payment_Strategy } from './payment.strategy';
import { Request } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class StripeCheckoutStrategy implements Payment_Strategy {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async startPayment(
    data: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const session = await this.stripe.checkout.sessions.create({
      ...data,
      mode: data.mode ?? 'payment',
      discounts: data.discounts ?? [],
      metadata: data.metadata ?? {},
      success_url: data.success_url ?? (process.env.SUCCESS_URL as string),
      cancel_url: data.cancel_url ?? (process.env.CANCEL_URL as string),
    });
    return session;
  }
  async createCoupon(
    data: Stripe.CouponCreateParams,
  ): Promise<Stripe.Response<Stripe.Coupon>> {
    const Coupon = await this.stripe.coupons.create({
      ...data,
    });
    return Coupon;
  }
  async webhook(req: Request) {
    let event: Stripe.Event = this.stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      process.env.WEBHOOK_KEY as string,
    );
    if (event.type !== 'checkout.session.completed')
      throw new BadRequestException('failed to pay');
    return event;
  }
  async createPaymentIntent(amount: number, orderId: Types.ObjectId) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount,
      currency: 'egp',
      metadata: { order: orderId.toString() },
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });
    return paymentIntent;
  }

  async refund(paymentIntentId: string, amount: number) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount * 100,
    });
  }
}
