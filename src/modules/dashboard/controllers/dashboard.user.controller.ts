import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Auth, Sys_Role } from 'src/common';
import { Dashboard_user_service } from '../services';
import { Types } from 'mongoose';

@Controller('Dashboard/user')
@Auth(Sys_Role.admin, Sys_Role.moderator)
export class Dashboard_user_Controller {
  constructor(private readonly adminUserService: Dashboard_user_service) {}

  @Get('list')
  allUsers(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.adminUserService.getusers(page);
  }
  @Get('search')
  searchUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('name') name: string,
  ) {
    return this.adminUserService.searchUsers(name, page);
  }
  @Auth(Sys_Role.admin)
  @Get('/:id')
  getUser(@Param('id') userId: Types.ObjectId) {
    return this.adminUserService.getUser(userId);
  }
  @Patch('bann-user/:id')
  BannUser(@Param('id') userId: Types.ObjectId) {
    return this.adminUserService.BannUser(userId);
  }
  @Patch('unbann-user/:id')
  unBannUser(@Param('id') userId: Types.ObjectId) {
    return this.adminUserService.unBannUser(userId);
  }
}
