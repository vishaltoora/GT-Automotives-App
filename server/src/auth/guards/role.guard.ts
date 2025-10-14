import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();

    console.log('[ROLE GUARD] Checking access:', {
      endpoint: `${request.method} ${request.url}`,
      requiredRoles,
      userRole: user?.role?.name,
      userId: user?.id,
      hasUser: !!user,
      hasRole: !!user?.role,
    });

    if (!user || !user.role) {
      console.log('[ROLE GUARD] REJECTED: No user or role');
      return false;
    }

    const hasAccess = requiredRoles.includes(user.role.name);
    console.log('[ROLE GUARD] Result:', hasAccess ? 'ALLOWED' : 'REJECTED');

    return hasAccess;
  }
}