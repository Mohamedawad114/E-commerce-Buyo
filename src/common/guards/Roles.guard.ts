import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const type = ctx.getType()
      let user: any;
   if (type === 'http') {
      const request = ctx.switchToHttp().getRequest();
      user = request.user;
    }

    // WebSocket
    if (type === 'ws') {
      const client = ctx.switchToWs().getClient();
      user = client.user;
    }
        if (!user) return false;
        const userRole = user.role;
        const methodRoles = this.reflector.get<string[]>('roles', ctx.getHandler());
        const classRoles = this.reflector.get<string[]>('roles', ctx.getClass());
        const roles: string[] = classRoles || methodRoles;
        if (!roles) return true;
        if (roles.includes(userRole)) return true;
        return false;
    }
  }

