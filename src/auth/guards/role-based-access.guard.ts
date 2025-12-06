import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { RoleValidatorProvider } from 'src/auth/providers/role-validator.provider';
import { UserRole } from 'src/common/enums/app.enums';

@Injectable()
export class RoleBasedAccessGuard implements CanActivate {
  constructor(
    private readonly roleValidator: RoleValidatorProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: ActiveUserData = request[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException();
    }

    // Get required role from context (will be set by AuthenticationGuard)
    const requiredRole: UserRole = request.requiredRole;

    if (!requiredRole) {
      throw new ForbiddenException('Access denied');
    }

    // Check if user has required role
    const hasAccess = this.roleValidator.hasRequiredRole(user.sub, requiredRole);

    if (!hasAccess) {
      throw new ForbiddenException('Not allowed to perform action');
    }

    return true;
  }
}