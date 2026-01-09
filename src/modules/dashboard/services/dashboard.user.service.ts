import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Crypto, EmailProducer, redis, UserRepo } from 'src/common';

@Injectable()
export class Dashboard_user_service {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly crypto: Crypto,
    private readonly emailQueue: EmailProducer,
  ) {}
  getusers = async (page: number = 1) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const users = await this.userRepo.findDocuments(
      { role: 'user', isBanned: false },
      { username: 1, email: 1, profilePicture: 1 },
      { skip: offset, limit, sort: { createdAt: -1 } },
    );
    const total = await this.userRepo.countDocuments({
      role: 'user',
      isBanned: false,
    });
    if (users.length == 0) {
      return { message: 'no Users yet' };
    }
    return {
      data: { users },
      meta: {
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    };
  };
  searchUsers = async (name: string, page: number) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    let users = await this.userRepo.findDocuments(
      { username: { $regex: `${name}`, $options: 'i' }, isBanned: false },
      { username: 1, profilePicture: 1 },
      { skip: offset, limit, sort: { createdAt: -1 } },
    );
    const total = await this.userRepo.countDocuments({
      username: { $regex: name, $options: 'i' },
      role: 'user',
      isBanned: false,
    });
    if (users.length == 0) {
      return { message: 'no Users for this name' };
    }
    return {
      data: { users },
      meta: {
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    };
  };
  getUser = async (userId: Types.ObjectId) => {
    const user = await this.userRepo.findByIdDocument(userId);
    if (!user) throw new NotFoundException('user not found');
    const phone = user.phoneNumber
      ? this.crypto.decryption(user.phoneNumber)
      : null;
    return {
      data: {
        data: {
          id: user._id,
          name: user.username,
          email: user.email,
          phoneNumber: phone,
          Age: user?.Age,
          provider: user?.provider,
          role: user.role,
          isConfirmed: user.isConfirmed,
        },
      },
    };
  };
  BannUser = async (userId: Types.ObjectId) => {
    const User = await this.userRepo.findByIdDocument(userId);
    if (!User) throw new NotFoundException('user not found');
    await this.userRepo.findAndUpdateDocument(User._id, { isBanned: true });
    await redis.sadd('banned_users', userId.toString());
    await this.emailQueue.sendEmailJob('BanUser', User.email);
    return { message: 'user banned successfully' };
  };
  unBannUser = async (userId: Types.ObjectId) => {
    const isBanned = await redis.sismember('banned_users', userId.toString());
    if (!isBanned) throw new NotFoundException('user not banned');
    await this.userRepo.findAndUpdateDocument(userId, { isBanned: false });
    await redis.srem('banned_users', userId.toString());
    return { message: 'user unbanned successfully' };
  };
  BannedUsers = async (page: number = 1) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    const users = await redis.smembers('banned_users');
    let total = await redis.scard('banned_users');
    if (users.length) {
      const bannedUsers = await this.userRepo.findDocuments(
        { _id: { $in: users.map((id) => new Types.ObjectId(id)) } },
        { username: 1, email: 1, profilePicture: 1 },
        { skip: offset, limit, sort: { createdAt: -1 } },
      );
      return {
        message: 'Banned users',
        data: { bannedUsers },
        meta: { total },
      };
    }
    const users_DB = await this.userRepo.findDocuments(
      { isBanned: true },
      {},
      { skip: offset, limit, sort: { createdAt: -1 } },
    );
    if (users_DB.length == 0) return { message: 'no Banned Users ' };
    total = await this.userRepo.countDocuments({
      isBanned: true,
    });
    return {
      data: { users_DB },
      meta: {
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    };
  };
}
