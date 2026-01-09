import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { EmailServices } from '../../Services';

@Processor('email')
export class EmailWorker extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailServices: EmailServices,
  ) {
    super();
  }

  async process(job: Job) {
    const { to } = job.data;
    switch (job.name) {
      case 'confirmation':
        await this.emailServices.createAndSendOTP(to);
        break;
      case 'reset_Password':
        await this.emailServices.createAndSendOTP_password(to);
        break;
      case 'BanUser':
        await this.emailServices.bannedUser_email(to);
        break;
      case 'orderPaid':
        const { orderId, amount, paymentId } = job.data;
        await this.emailServices.orderPaid_email(
          to,
          orderId,
          paymentId,
          amount,
        );
        break;
      case 'orderCancel':
        await this.emailServices.orderCancel_email(
          to,
          orderId,
          paymentId,
          amount,
        );
        break;
      case 'orderExpired':
        await this.emailServices.orderExpired_email(to, orderId);
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        throw new Error('Unknown job type');
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
