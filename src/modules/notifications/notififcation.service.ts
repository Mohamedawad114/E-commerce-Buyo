import { Request, Response } from 'express';
import { IUser, NotificationRepo } from 'src/common';

export class NotificationsServices {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  unReadNotifications = async (user: IUser, page: number) => {
    const limit = 5;
    const skip = (page - 1) * limit;
    const notifications = await this.notificationRepo.findDocuments(
      { userId: user._id, isRead: false },
      { userId: 0, isRead: 0 },
      { lean: true, limit, skip, sort: { createdAt: -1 } },
    );
    const total: number = await this.notificationRepo.countDocuments({
      userId: user._id,
      isRead: false,
    });
    const pages = Math.ceil(total / limit);
    await this.notificationRepo.updateManyDocuments(
      { userId: user._id, isRead: false },
      { isRead: true },
    );
    if (notifications.length) {
      return {
        message: 'unRead notifications',
        data: { notifications },
        meta: { total, pages },
      };
    }
    return { message: 'no unRead notifications yet' };
  };
  allReadNotifications = async (user: IUser, page: number) => {
    const limit = 8;
    const skip = (page - 1) * limit;
    const notifications = await this.notificationRepo.findDocuments(
      { userId: user._id, isRead: true },
      { userId: 0 },
      { lean: true, limit, skip, sort: { createdAt: -1 } },
    );
    return { message: 'Read notifications', data: { notifications } };
  };

  delete_Notifications = async (user: IUser) => {
    const notifications = await this.notificationRepo.deleteManyDocuments({
      userId: user._id,
      isRead: true,
    });
    return {
      message: ' notifications deleted',
      data: { notifications },
    };
  };
}
