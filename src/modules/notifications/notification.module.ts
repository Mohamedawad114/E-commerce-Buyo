import { Module } from '@nestjs/common';
import { notificationModel } from 'src/DB';
import { commonModule, NotificationRepo } from 'src/common';
import { NotificationsServices } from './notififcation.service';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [NotificationsServices, NotificationRepo],
  imports: [notificationModel, commonModule],
})
export class NotificationModule {}
