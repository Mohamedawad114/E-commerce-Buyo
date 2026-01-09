import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from 'src/DB';
import {
  commonModule,
  Crypto,
  EmailModule,
  s3_services,
  TokenModule,
  TwoFA_services,
  UserRepo,
} from 'src/common';

@Module({
  imports: [commonModule, EmailModule],
  providers: [UserService, Crypto, s3_services, TwoFA_services],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}
