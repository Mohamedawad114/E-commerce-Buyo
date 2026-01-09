
import { NotificationDocument } from "src/DB";
import { BaseRepository } from "./Base.repository";
import { Model } from "mongoose";


export class NotificationRepo extends BaseRepository<NotificationDocument> {
  constructor(protected NotifiactionModel: Model<NotificationDocument>) {
    super(NotifiactionModel);
  }
  async updateNotification(
    notification: NotificationDocument,
  ): Promise<NotificationDocument> {
    return await notification.save();
  }
}