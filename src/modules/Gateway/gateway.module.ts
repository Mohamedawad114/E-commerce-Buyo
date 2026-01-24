import { Module } from '@nestjs/common';
import { realTimeGateway } from './gateway';
import { UserModel } from 'src/DB';
import { TokenModule, UserRepo } from 'src/common';

@Module({
  providers: [realTimeGateway, UserRepo],
  imports: [UserModel, TokenModule],
})
export class GatewayModule {}
