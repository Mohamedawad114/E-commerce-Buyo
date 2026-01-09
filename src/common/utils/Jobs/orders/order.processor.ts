import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { PinoLogger } from 'nestjs-pino';
import { EmailServices } from '../../Services';
import { EmailProducer } from '../emails/email.producer';
import { Job } from 'bullmq';
import { Order_Repo, productRepo } from 'src/common/Repository';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { orderStatus } from 'src/common/Enums';
import { UserDocument } from 'src/DB';

@Processor('order')
export class OrderWorkr extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailProducer: EmailProducer,
    private readonly orderRepo: Order_Repo,
    private readonly productRepo: productRepo,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    const { orderId } = job.data;
    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      const order = await this.orderRepo.findOneDocument(
        {
          _id: orderId,
          status: orderStatus.Pending,
        },
        {},
        { populate: { path: 'userId', select: 'email' }, session },
      );
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return;
      }
      await Promise.all(
        order.products.map(async (p) => {
          return this.productRepo.findOneDocumentAndUpdate(
            { _id: p.productId },
            {
              $inc: { stock: p.quantity, sold: -p.quantity },
            },
            { session },
          );
        }),
      );
      order.status = orderStatus.Cancel;
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      await this.emailProducer.sendEmailJob(
        (order.userId as unknown as UserDocument).email,
        'orderExpired',
        order.orderId,
      );
      this.logger.info(`Order ${orderId} has been expired and restocked.`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.logger.error(
        `Error processing expiry for order ${orderId}: ${error.message}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  handleCompleted(job: Job) {
    this.logger.info(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  handleFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed: ${err.message}`);
  }
}
