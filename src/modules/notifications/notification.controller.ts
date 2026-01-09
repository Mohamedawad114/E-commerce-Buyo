import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { NotificationsServices } from './notififcation.service';
import { AuthUser, type IUser } from 'src/common';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationsServices) {}

  @HttpCode(200)
  @Get('unread-notifications')
  unReadNotifications(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.notificationService.unReadNotifications(user, page);
  }
  @HttpCode(200)
  @Get('/')
  readNotifications(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.notificationService.allReadNotifications(user, page);
  }
  @HttpCode(200)
  @Get('delete-notifications')
  deleteNotifications(@AuthUser() user: IUser) {
    return this.notificationService.delete_Notifications(user);
  }
}
