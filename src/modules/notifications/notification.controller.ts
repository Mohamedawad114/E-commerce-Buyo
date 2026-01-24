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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationsServices) {}

  @ApiOperation({ summary: 'Get unread notifications for the logged-in user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @HttpCode(200)
  @Get('unread-notifications')
  unReadNotifications(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.notificationService.unReadNotifications(user, page);
  }

  @ApiOperation({ summary: 'Get read notifications for the logged-in user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @HttpCode(200)
  @Get('/')
  readNotifications(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.notificationService.allReadNotifications(user, page);
  }

  @ApiOperation({ summary: 'Delete all notifications for the logged-in user' })
  @HttpCode(200)
  @Get('delete-notifications')
  deleteNotifications(@AuthUser() user: IUser) {
    return this.notificationService.delete_Notifications(user);
  }
}
