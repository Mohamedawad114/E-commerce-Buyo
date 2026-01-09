import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Auth, AuthUser, type IUser, Sys_Role } from 'src/common';
import { UserService } from './user.service';
import {
  resetPasswordDto,
  TwoFADto,
  updatePasswordDto,
  updateProfileDto,
  updateProfileImageDto,
} from './Dto';
import type { Request, Response } from 'express';


@Auth(Sys_Role.user, Sys_Role.moderator, Sys_Role.admin)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@AuthUser() user: IUser) {
    return this.userService.getProfile(user);
  }
  @Put('update')
  updateProfile(@AuthUser() user: IUser, @Body() Dto: updateProfileDto) {
    return this.userService.Updateuser(Dto, user);
  }
  @Patch('update-password')
  updatePassword(
    @AuthUser() user: IUser,
    @Body() Dto: updatePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.updatePassword(Dto, user, res);
  }
  @Get('reset-passwordReq')
  resetPasswordReq(@AuthUser() user: IUser) {
    return this.userService.resetPasswordreq(user);
  }
  @Get('resend-OTP-reset')
  resendOTP_reset(@AuthUser() user: IUser) {
    return this.userService.resendOTP_reset(user);
  }
  @Patch('reset-password')
  resetPassword(
    @AuthUser() user: IUser,
    @Body() Dto: resetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.resetPasswordconfrim(user, Dto, res);
  }
  @Get('upload-profile-picture')
  profilePicture(@AuthUser() user: IUser) {
    return this.userService.uploadProfile_pic(user);
  }
  @Patch('update-profile-picture')
  updateProfie(@AuthUser() user: IUser, @Body() Dto: updateProfileImageDto) {
    return this.userService.updateProfilePic(Dto, user);
  }
  @Patch('setup-2FA')
  enable_2FA(@AuthUser() user: IUser) {
    return this.userService.setup2FA(user);
  }
  @Patch('verifySetup-2FA')
  verify_2FA(@AuthUser() user: IUser, @Body() Dto: TwoFADto) {
    return this.userService.verifySetup2FA(user, Dto.code);
  }
  @Delete('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.userService.logout(req, res);
  }
  @Delete('logoutALL-devices')
  logoutAllDevices(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.logoutAllDevices(req, res);
  }
  @Delete('delete-account')
  deleteAccount(
    @AuthUser() user: IUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.deleteAccount(user, res, req);
  }
}
