import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenServices } from '../Handlers';
import { UserRepo } from '../Repository';
import { redis } from '../utils';
import { Socket } from 'socket.io';
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private tokenService: TokenServices,
    private readonly userRepo: UserRepo,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();
    switch (type) {
      case 'http':
        const req = context.switchToHttp().getRequest();
        const headers = context.switchToHttp().getRequest().headers;
        const token = headers['authorization']?.split(' ')[1];
        if (!token) return false;
        if (await redis.get(`tokens_blacklist:${token}`))
          throw new UnauthorizedException('token is blacklisted');
        const decoded = this.tokenService.VerifyAccessToken(token);
        const isExited = await this.userRepo.findByIdDocument(decoded.id);
        if (!isExited) throw new UnauthorizedException('user not found');
        req.user = isExited;
        return true;

      case 'ws':
        {
          const client: Socket = context.switchToWs().getClient();
          const authHeader =
            client.handshake.auth ?? client.handshake.headers['authorization'];
          if (!authHeader) return false;
          const token = authHeader.split(' ')[1];
          if (!token) return false;
          if (await redis.get(`tokens_blacklist:${token}`))
            throw new UnauthorizedException('token is blacklisted');
          const decoded = this.tokenService.VerifyAccessToken(token);
          const user = await this.userRepo.findByIdDocument(decoded.id);
          if (!user) throw new UnauthorizedException('user not found');
          client.data.user = user;
        }
        return true;
    }
    return false;
  }
}
