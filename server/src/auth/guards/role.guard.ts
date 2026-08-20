import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { isAuthDebugEnabled } from '../auth-logging';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const endpoint = `${request.method} ${request.url}`;

    if (!user || !user.role) {
      this.logger.warn(`Denied ${endpoint}: request has no authenticated user`);
      return false;
    }

    const hasAccess = requiredRoles.includes(user.role.name);

    // Only denials are logged by default. Logging every allowed request here
    // put several lines on the console for each role-protected call, which
    // buried real errors in the production log stream.
    if (!hasAccess) {
      this.logger.warn(
        `Denied ${endpoint} for user ${user.id}: role ${user.role.name} ` +
          `not in [${requiredRoles.join(', ')}]`
      );
    } else if (isAuthDebugEnabled()) {
      this.logger.debug(`Allowed ${endpoint} for role ${user.role.name}`);
    }

    return hasAccess;
  }
}
