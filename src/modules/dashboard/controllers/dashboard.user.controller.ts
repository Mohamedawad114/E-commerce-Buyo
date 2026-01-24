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
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Dashboard Users')
@Auth(Sys_Role.admin, Sys_Role.moderator)
@Controller('Dashboard/user')
export class Dashboard_user_Controller {
  constructor(private readonly adminUserService: Dashboard_user_service) {}

  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @Get('list')
  allUsers(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.adminUserService.getusers(page);
  }

  @ApiOperation({ summary: 'Search users by name' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'name', required: true, type: String })
  @Get('search')
  searchUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('name') name: string,
  ) {
    return this.adminUserService.searchUsers(name, page);
  }

  @ApiOperation({ summary: 'Get single user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Auth(Sys_Role.admin)
  @Get('/:id')
  getUser(@Param('id') userId: Types.ObjectId) {
    return this.adminUserService.getUser(userId);
  }

  @ApiOperation({ summary: 'Ban a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Patch('bann-user/:id')
  BannUser(@Param('id') userId: Types.ObjectId) {
    return this.adminUserService.BannUser(userId);
  }

  @ApiOperation({ summary: 'Unban a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Patch('unbann-user/:id')
  unBannUser(@Param('id') userId: Types.ObjectId) {
    return this.adminUserService.unBannUser(userId);
  }
}
