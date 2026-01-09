import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/Roles.guard';
import { AuthenticationGuard } from '../guards';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export function Auth(...roles: string[]) {
  return applyDecorators(
    UseGuards(AuthenticationGuard),
    UseGuards(RolesGuard),
    Roles(...roles),
  );
}
