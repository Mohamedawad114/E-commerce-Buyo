import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenServices } from '../Handlers';
import { UserRepo } from '../Repository';
import { redis } from '../utils';

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
    }
    return false;
  }
}
