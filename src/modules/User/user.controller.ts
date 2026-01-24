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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('User')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.user, Sys_Role.moderator, Sys_Role.admin)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully',
  })
  getProfile(@AuthUser() user: IUser) {
    return this.userService.getProfile(user);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update user profile data' })
  @ApiBody({ type: updateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(@AuthUser() user: IUser, @Body() dto: updateProfileDto) {
    return this.userService.Updateuser(dto, user);
  }

  @Patch('update-password')
  @ApiOperation({ summary: 'Update current password' })
  @ApiBody({ type: updatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  updatePassword(
    @AuthUser() user: IUser,
    @Body() dto: updatePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.updatePassword(dto, user, res);
  }

  @Get('reset-passwordReq')
  @ApiOperation({ summary: 'Request password reset OTP' })
  resetPasswordReq(@AuthUser() user: IUser) {
    return this.userService.resetPasswordreq(user);
  }

  @Get('resend-OTP-reset')
  @ApiOperation({ summary: 'Resend reset password OTP' })
  resendOTP_reset(@AuthUser() user: IUser) {
    return this.userService.resendOTP_reset(user);
  }

  @Patch('reset-password')
  @ApiOperation({ summary: 'Confirm password reset with OTP' })
  @ApiBody({ type: resetPasswordDto })
  resetPassword(
    @AuthUser() user: IUser,
    @Body() dto: resetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.resetPasswordconfrim(user, dto, res);
  }
  @Get('upload-profile-picture')
  @ApiOperation({ summary: 'Get upload profile picture data (presigned URL)' })
  profilePicture(@AuthUser() user: IUser) {
    return this.userService.uploadProfile_pic(user);
  }

  @Patch('update-profile-picture')
  @ApiOperation({ summary: 'Update profile picture' })
  @ApiBody({ type: updateProfileImageDto })
  updateProfie(@AuthUser() user: IUser, @Body() dto: updateProfileImageDto) {
    return this.userService.updateProfilePic(dto, user);
  }
  @Patch('setup-2FA')
  @ApiOperation({ summary: 'Enable two-factor authentication (2FA)' })
  enable_2FA(@AuthUser() user: IUser) {
    return this.userService.setup2FA(user);
  }

  @Patch('verifySetup-2FA')
  @ApiOperation({ summary: 'Verify and activate 2FA' })
  @ApiBody({ type: TwoFADto })
  verify_2FA(@AuthUser() user: IUser, @Body() dto: TwoFADto) {
    return this.userService.verifySetup2FA(user, dto.code);
  }
  @Delete('logout')
  @ApiOperation({ summary: 'Logout from current device' })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.userService.logout(req, res);
  }

  @Delete('logoutALL-devices')
  @ApiOperation({ summary: 'Logout from all devices' })
  logoutAllDevices(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.logoutAllDevices(req, res);
  }


  @Delete('delete-account')
  @ApiOperation({ summary: 'Delete user account permanently' })
  deleteAccount(
    @AuthUser() user: IUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.deleteAccount(user, res, req);
  }
}
