import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Types } from 'mongoose';

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue('order') private readonly orderQueue: Queue) {}
  order_schedule = async (orderId: string, userId: Types.ObjectId) => {
    await this.orderQueue.add(
      'order_schedule',
      {
        orderId,
      },
      {
        attempts: 3,
        removeOnFail: false,
        removeOnComplete: true,
        delay: 60 * 60 * 3 * 24,
      },
    );
  };
}
