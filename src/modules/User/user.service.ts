import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  compare_hash,
  Crypto,
  EmailProducer,
  IUser,
  redis,
  s3_services,
  TokenServices,
  TwoFA_services,
  UserRepo,
} from 'src/common';
import {
  resetPasswordDto,
  updatePasswordDto,
  updateProfileDto,
  updateProfileImageDto,
} from './Dto';
import { Request, Response } from 'express';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    private readonly crypto: Crypto,
    private readonly emailQueue: EmailProducer,
    private tokenServices: TokenServices,
    private readonly s3Services: s3_services,
    @InjectConnection() private readonly connection: Connection,
    private readonly TwoFa: TwoFA_services,
  ) {}
  getProfile = async (user: IUser) => {
    const phone = user?.phoneNumber
      ? this.crypto.decryption(user.phoneNumber)
      : null;
    return {
      message: 'Profile',
      data: {
        userId: user._id,
        username: user?.username,
        email: user?.email,
        age: user?.Age,
        phoneNumber: phone,
        gender: user?.gender,
        profilePicture: user?.profilePicture,
      },
    };
  };
  Updateuser = async (Dto: updateProfileDto, user: IUser) => {
    if (Dto.email && Dto.email !== user.email) {
      const emailExists = await this.userRepo.findOneDocument({
        email: Dto.email,
      });
      if (emailExists) {
        throw new ConflictException(`email already existed`);
      }
      Dto.isConfirmed = false;
    }
    if (Dto.phoneNumber)
      Dto.phoneNumber = this.crypto.encryption(Dto.phoneNumber);
    const updatedUser = await this.userRepo.findAndUpdateDocument(user._id, {
      ...Dto,
    });
    if (!updatedUser) throw new BadRequestException(`something wrong`);
    await this.emailQueue.sendEmailJob('confirmation', updatedUser.email);
    return { message: 'user updated successfully', data: { updatedUser } };
  };
  updatePassword = async (
    Dto: updatePasswordDto,
    user: IUser,
    res: Response,
  ) => {
    const userDoc = await this.userRepo.findByIdDocument(
      user._id,
      {},
      { select: '+password' },
    );
    if (!userDoc) throw new NotFoundException('user not found');
    const isMatch = await compare_hash(
      Dto.oldPassword,
      userDoc?.password as string,
    );
    if (!isMatch) throw new BadRequestException(`invalid oldPasword`);
    userDoc.password = Dto.confirmPassword;
    await this.userRepo.updateUser(userDoc);
    const keys = await redis.keys(`refreshToken:${user._id}:*`);
    if (keys.length) await redis.del(...keys);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return { message: 'password updated successfully' };
  };
  resetPasswordreq = async (user: IUser) => {
    this.emailQueue.sendEmailJob('reset_Password', user.email);
    return { message: `OTP is sent` };
  };
  async resendOTP_reset(user: IUser) {
    this.emailQueue.sendEmailJob('reset_Password', user.email);
    return { message: `OTP is sent` };
  }
  resetPasswordconfrim = async (
    user: IUser,
    Dto: resetPasswordDto,
    res: Response,
  ) => {
    const userDoc = await this.userRepo.findByIdDocument(
      user._id,
      {},
      { select: '+password' },
    );
    if (!userDoc) throw new NotFoundException('user not found');
    const savedOTP = await redis.get(`otp_reset:${user.email}`);
    if (!savedOTP) throw new BadRequestException(`expire OTP.`);
    const isMatch = await compare_hash(Dto.OTP, savedOTP);
    if (!isMatch) throw new BadRequestException(`Invalid OTP`);
    userDoc.password = Dto.confirmPassword;
    await redis.del(`otp_reset:${user.email}`);
    await this.userRepo.updateUser(userDoc);
    const keys = await redis.keys(`refreshToken:${user._id}:*`);
    if (keys.length) await redis.del(...keys);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return { message: 'password reset successfully' };
  };
  uploadProfile_pic = async (user: IUser) => {
    const userId = user._id;
    const key = `users/${userId}`;
    const { Key, url } = await this.s3Services.upload_file(key);
    return { message: 'upload url generated', data: { Key, url } };
  };
  updateProfilePic = async (Dto: updateProfileImageDto, user: IUser) => {
    const { key } = Dto;
    const { uploaded } = await this.s3Services.verifyUpload(key);
    if (!uploaded) throw new BadRequestException('file not uploaded');
    if (user.profilePicture)
      await this.s3Services.deleteFile(user?.profilePicture);
    await this.userRepo.findAndUpdateDocument(user._id, {
      profilePicture: key,
    });
    return {
      message: 'profile picture updated',
      data: { profilePicture: key },
    };
  };

  setup2FA = async (user: IUser) => {
    const email = user.email;
    const { qr } = await this.TwoFa.generateSecret(email);
    return { data: { qr } };
  };
  verifySetup2FA = async (user: IUser, code: string) => {
    const secretHashed = await redis.get(`${user.email}_secret`);
    if (!secretHashed) throw new UnauthorizedException();
    const secret = this.crypto.decryption(secretHashed);
    const isTrue = this.TwoFa.verifyCode(code, secret);
    if (isTrue) {
      const { hashedCodes, backupCodes } =
        await this.TwoFa.generateBackupCodes();
      await this.userRepo.findAndUpdateDocument(user._id, {
        TwoFA: true,
        secret: this.crypto.encryption(secret),
        backupCodesHashed: hashedCodes,
      });
      await redis.del(`${user.email}_secret`);
      return { message: '2FA is enabled', data: { backupCodes } };
    } else return { message: 'code is incorrect' };
  };

  logout = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new BadRequestException('no refresh token found');
    const decoded = this.tokenServices.VerifyRefreshToken(token);
    await redis.del(`refreshToken:${decoded.id}:${decoded.jti}`);
    await redis.set(`tokens_blacklist:${accessToken}`, '0', 'EX', 60 * 30);
    res.clearCookie('refreshToken');
    return ;
  };

  logoutAllDevices = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new BadRequestException('no refresh token found');
    const decoded = this.tokenServices.VerifyRefreshToken(token);
    await redis.del(`refreshToken:${decoded.id}:*`);
    await redis.set(`tokens_blacklist:${accessToken}`, '0', 'EX', 60 * 30);
    res.clearCookie('refreshToken');
    return;
  };
  deleteAccount = async (user: IUser, res: Response, req: Request) => {
    const userId = user._id;
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const deleted = await this.userRepo.findByIdAndDeleteDocument(userId, {
        session,
      });
      // await this.postRepo.deleteManyDocuments({ userId }, { session });
      // await this.commnetRepo.deleteManyDocuments({ userId }, { session });
      await session.commitTransaction();
      session.endSession();
      // await this.s3Client.deleteListderictory(userId.toString());
      return {data: {deleted} };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  };
}
