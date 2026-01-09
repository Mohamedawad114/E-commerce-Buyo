import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class EmailProducer {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}
  sendEmailJob = async (
    type: string,
    to: string,
    orderId?: string,
    paymentId?: string,
    amount?: number,
  ) => {
    await this.emailQueue.add(
      type,
      {
        to,
        orderId,
        paymentId,
        amount,
      },
      {
        attempts: 3,
        removeOnFail: false,
        removeOnComplete: true,
      },
    );
  };
}
