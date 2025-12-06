import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_TYPE_KEY } from 'src/auth/decorators/auth.decorator';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { RoleBasedAccessGuard } from '../role-based-access.guard';
import { AuthType, UserRole } from 'src/common/enums/app.enums';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  // Set the default Auth Type
  private static readonly defaultAuthType = AuthType.User;

  // Map AuthType to UserRole
  private readonly authTypeToRoleMap: Record<AuthType, UserRole | null> = {
    [AuthType.SuperAdmin]: UserRole.SUPERADMIN,
    [AuthType.Admin]: UserRole.ADMIN,
    [AuthType.Staff]: UserRole.STAFF,
    [AuthType.User]: UserRole.USER,
    [AuthType.None]: null,
  };

  // Create authTypeGuardMap
  private readonly authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]> = {
    [AuthType.SuperAdmin]: [this.accessTokenGuard, this.roleBasedAccessGuard],
    [AuthType.Admin]: [this.accessTokenGuard, this.roleBasedAccessGuard],
    [AuthType.Staff]: [this.accessTokenGuard, this.roleBasedAccessGuard],
    [AuthType.User]: [this.accessTokenGuard, this.roleBasedAccessGuard],
    [AuthType.None]: { canActivate: () => true },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly roleBasedAccessGuard: RoleBasedAccessGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    // For role-based auth, we only expect one auth type
    const authType = authTypes[0];
    const requiredRole = this.authTypeToRoleMap[authType];

    // Set required role in request for RoleBasedAccessGuard
    const request = context.switchToHttp().getRequest();
    request.requiredRole = requiredRole;

    const guards = Array.isArray(this.authTypeGuardMap[authType]) 
      ? this.authTypeGuardMap[authType] as CanActivate[]
      : [this.authTypeGuardMap[authType] as CanActivate];

    // Execute guards in sequence
    for (const guard of guards) {
      const canActivate = await Promise.resolve(guard.canActivate(context));
      if (!canActivate) {
        throw new UnauthorizedException();
      }
    }

    return true;
  }
}