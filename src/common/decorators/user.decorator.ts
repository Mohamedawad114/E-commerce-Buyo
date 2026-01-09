import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../Interfaces';

export const AuthUser = createParamDecorator(
  (data: IUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
