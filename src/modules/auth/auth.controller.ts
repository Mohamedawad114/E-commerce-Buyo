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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create new account with email & password' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  signup(@Body() data: SignUpDto) {
    return this.authServices.SignUp(data);
  }

  @HttpCode(201)
  @Post('signup-gmail')
  @ApiOperation({ summary: 'Signup/Login using Google provider' })
  @ApiBody({ type: signupByProviderDTO })
  @ApiResponse({ status: 201, description: 'Authenticated with Google' })
  signupGmail(
    @Body() dto: signupByProviderDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authServices.signWithGoogle(dto, res);
  }

 
  @HttpCode(200)
  @Post('login')
  @Throttle({ login: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authServices.loginuser(dto, res);
  }

  @Throttle({ TwoFA: { limit: 5, ttl: 60 } })
  @HttpCode(200)
  @Post('2FA')
  @ApiOperation({ summary: 'Verify two-factor authentication code' })
  @ApiBody({ type: VerifyTwoFADto })
  @ApiResponse({ status: 200, description: '2FA verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  verify2FA(
    @Body() dto: VerifyTwoFADto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authServices.verifyAuth(dto, res);
  }

  @HttpCode(200)
  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirm user email using OTP' })
  @ApiBody({ type: ConfirmEmailDto })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  confirmEmail(@Body() dto: ConfirmEmailDto) {
    return this.authServices.confrim_email(dto);
  }

  @HttpCode(200)
  @Get('resend-OTP')
  @ApiOperation({ summary: 'Resend OTP to user email' })
  @ApiQuery({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  resendOTP(@Query() dto: ResendOtpDto) {
    return this.authServices.resendOTP(dto);
  }

  @HttpCode(200)
  @Get('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refreshTokoen(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authServices.refreshToken(req, res);
  }
}
