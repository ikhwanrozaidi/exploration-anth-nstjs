import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/common/enums/app.enums';

@Injectable()
export class RoleValidatorProvider {
  /**
   * Extract user role from user ID based on prefix
   */
  public getUserRoleFromId(userId: number): UserRole {
    const userIdStr = userId.toString();
    
    if (userIdStr.startsWith('44')) {
      return UserRole.SUPERADMIN;
    } else if (userIdStr.startsWith('14')) {
      return UserRole.ADMIN;
    } else if (userIdStr.startsWith('15')) {
      return UserRole.STAFF;
    } else {
      return UserRole.USER;
    }
  }

  /**
   * Check if user has required role for access
   */
  public hasRequiredRole(userId: number, requiredRole: UserRole): boolean {
    const userRole = this.getUserRoleFromId(userId);
    return userRole === requiredRole;
  }

  /**
   * Get role prefix for ID generation
   */
  public getRolePrefix(role: UserRole): string {
    switch (role) {
      case UserRole.SUPERADMIN:
        return '44';
      case UserRole.ADMIN:
        return '14';
      case UserRole.STAFF:
        return '15';
      case UserRole.USER:
        return '';
      default:
        return '';
    }
  }

  /**
   * Get starting number for each role
   */
  public getRoleStartingNumber(role: UserRole): number {
    switch (role) {
      case UserRole.SUPERADMIN:
        return 440001;
      case UserRole.ADMIN:
        return 140001;
      case UserRole.STAFF:
        return 150001;
      case UserRole.USER:
        return 1;
      default:
        return 1;
    }
  }
}