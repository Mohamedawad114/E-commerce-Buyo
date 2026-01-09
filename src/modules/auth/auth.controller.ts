import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ConfirmEmailDto,
  LoginDto,
  SignUpDto,
  signupByProviderDTO,
} from './DTO';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { ResendOtpDto } from './DTO/resendOTP.Dto';
import { VerifyTwoFADto } from '../User/Dto';
import { Throttle } from '@nestjs/throttler';

@Controller('Auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('signup')
  signup(@Body() data: SignUpDto) {
    return this.authServices.SignUp(data);
  }

  @HttpCode(201)
  @Post('signup-gmail')
  signupGmail(
    @Body() Dto: signupByProviderDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authServices.signWithGoogle(Dto, res);
  }
  @HttpCode(200)
  @Post('login')
  @Throttle({ login: { limit: 5, ttl: 60 } })
  login(@Body() Dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authServices.loginuser(Dto, res);
  }

  @Throttle({ TwoFA: { limit: 5, ttl: 60 } })
  @HttpCode(200)
  @Post('2FA')
  verify2FA(
    @Body() Dto: VerifyTwoFADto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authServices.verifyAuth(Dto, res);
  }

  @HttpCode(200)
  @Post('confirm-email')
  confirmEmail(@Body() Dto: ConfirmEmailDto) {
    return this.authServices.confrim_email(Dto);
  }

  @HttpCode(200)
  @Get('resend-OTP')
  resendOTP(@Query() Dto: ResendOtpDto) {
    return this.authServices.resendOTP(Dto);
  }

  @HttpCode(200)
  @Get('refresh-token')
  refreshTokoen(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authServices.refreshToken(req, res);
  }
}
