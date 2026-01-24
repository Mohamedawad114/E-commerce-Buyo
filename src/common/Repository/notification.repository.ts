import { Notification, NotificationDocument } from 'src/DB';
import { BaseRepository } from './Base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export class NotificationRepo extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    protected NotifiactionModel: Model<NotificationDocument>,
  ) {
    super(NotifiactionModel);
  }
  async updateNotification(
    notification: NotificationDocument,
  ): Promise<NotificationDocument> {
    return await notification.save();
  }
}
