import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  compare_hash,
  Crypto,
  EmailProducer,
  Provider,
  redis,
  TokenServices,
  TwoFA_services,
  UserRepo,
} from 'src/common';
import {
  ConfirmEmailDto,
  LoginDto,
  SignUpDto,
  signupByProviderDTO,
} from './DTO';
import { OAuth2Client } from 'google-auth-library';
import { ResendOtpDto } from './DTO/resendOTP.Dto';
import { VerifyTwoFADto } from '../User/Dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly Tokenservices: TokenServices,
    private readonly emailQueue: EmailProducer,
    private readonly crypto: Crypto,
    private readonly TwoFA: TwoFA_services,
  ) {}
  SignUp = async (data: SignUpDto) => {
    const checkEmail = await this.userRepo.findOneDocument({
      email: data.email,
    });
    if (checkEmail) throw new ConflictException(`email is already exist`, {});
    const usercreated = await this.userRepo.createDocument({
      ...data,
      phoneNumber: this.crypto.encryption(data?.phoneNumber),
    });
    await this.emailQueue.sendEmailJob('confirmation', usercreated.email);
    return {
      message: 'signup seccussfully',
      data: {
        userData: {
          username: usercreated.username,
          email: usercreated.email,
          Age: usercreated.Age,
          gender: usercreated.gender,
        },
      },
    };
  };
  confrim_email = async (confirmDTO: ConfirmEmailDto) => {
    const User = await this.userRepo.findOneDocument({
      email: confirmDTO.email,
    });
    if (!User) throw new NotFoundException(`user not found`, {});
    if (!confirmDTO.OTP) throw new BadRequestException(`OTP required`, {});
    const savedOTP = await redis.get(`otp_${confirmDTO.email}`);
    if (!savedOTP) {
      throw new BadRequestException(`expire OTP`, {});
    }
    const isMAtch = compare_hash(confirmDTO.OTP, savedOTP);
    if (!isMAtch) throw new BadRequestException(`invalid OTP`, {});
    User.isConfirmed = true;
    await redis.del(`otp_${confirmDTO.email}`);
    await this.userRepo.findAndUpdateDocument(User._id, { isConfirmed: true });
    return { message: `email is confirmed ` };
  };
  async verifyloginGoogle(idToken: string) {
    if (!idToken) throw new BadRequestException('idToken is required');
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.CLIENTID as string,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  signWithGoogle = async (Dto: signupByProviderDTO, res: Response) => {
    const idToken = Dto.idToken;
    const payload = await this.verifyloginGoogle(idToken);
    const { name, email, email_verified, sub } = payload as any;
    if (!email_verified) throw new BadRequestException('email not verified');
    const user = await this.userRepo.findOneDocument({ email });
    if (user) {
      const accessToken = this.Tokenservices.generateAccessToken({
        id: user?._id.toString(),
        username: name,
      });
      return { message: 'Login successfully', data: { accessToken } };
    }
    const createdUser = await this.userRepo.createDocument({
      username: name,
      email: email,
      isConfirmed: true,
      provider: Provider.google,
      subId: sub,
    });
    const accessToken = await this.Tokenservices.generateTokens(
      {
        id: createdUser._id.toString(),
        role: createdUser.role,
        username: createdUser.username,
      },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };

  resendOTP = async (Dto: ResendOtpDto) => {
    const email: string = Dto.email;
    const User = await this.userRepo.findOneDocument({
      email: email,
      isConfirmed: false,
    });
    if (!User) throw new NotFoundException(`email not found or confimed`);
    await this.emailQueue.sendEmailJob('confirmation', email);
    return { message: 'OTP send' };
  };

  loginuser = async (Dto: LoginDto, res: Response) => {
    const { email, password } = Dto;
    const user = await this.userRepo.findOneDocument(
      {
        email: email,
      },
      {},
      { select: '+password' },
    );
    if (!user) throw new NotFoundException(`email not found`);
    if (!user.isConfirmed) {
      throw new BadRequestException(
        `email not verified please verify email first`,
      );
    }
    const passMatch = await compare_hash(password, user?.password as string);
    if (!passMatch) throw new BadRequestException(`invalid Password or email`);
    if (!user.TwoFA) {
      const { accessToken } = await this.Tokenservices.generateTokens(
        {
          id: user._id.toString(),
          role: user.role,
          username: user.username,
        },
        res,
      );
      return { message: 'Login successfully', data: { accessToken } };
    }
    return {
      message: 'please enter authentication code',
      data: { userId: user._id },
    };
  };
  verifyAuth = async (Dto: VerifyTwoFADto, res: Response) => {
    const user = await this.userRepo.findByIdDocument(
      Dto.userId,
      {},
      { select: '+secret +backupCodesHashed' },
    );
    if (!user?.secret)
      throw new BadRequestException('Two-factor authentication not enabled');
    const { code } = Dto;
    const isTrue = this.TwoFA.verifyCode(code,this.crypto.decryption( user.secret));
    if (!isTrue) {
      const { auth, newHashedCodes } = await this.TwoFA.validateBackupCodes(
        code,
        user.backupCodesHashed,
      );
      if (!auth) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
      await this.userRepo.findAndUpdateDocument(Dto.userId, {
        $set: { backupCodesHashed: newHashedCodes },
      });
      const { accessToken } = await this.Tokenservices.generateTokens(
        {
          id: user._id.toString(),
          role: user.role,
          username: user.username,
        },
        res,
      );
      return { message: 'Login successfully', data: { accessToken } };
    }
    const { accessToken } = await this.Tokenservices.generateTokens(
      {
        id: user._id.toString(),
        role: user.role,
        username: user.username,
      },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };
  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedException();
    const decoded = this.Tokenservices.VerifyRefreshToken(token);
    const isexisted = await redis.get(
      `refreshToken_${decoded.id}:${decoded.jti}`,
    );
    if (!isexisted) {
      throw new ForbiddenException();
    }
    const accessToken: string = this.Tokenservices.generateAccessToken({
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    });

    await this.Tokenservices.generateRefreshTokens(
      {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
      },
      res,
      decoded.jti,
    );
    return { message: 'AccessToken', data: { accessToken } };
  };
}
