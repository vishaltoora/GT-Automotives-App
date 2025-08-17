import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    // In development mode, check for mock token
    if (process.env.NODE_ENV === 'development') {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      if (authHeader === 'Bearer mock-jwt-token-development') {
        // Set mock user for development
        request.user = {
          id: 'dev-user-1',
          email: 'customer@example.com',
          role: 'STAFF', // Give STAFF role for testing invoice creation
          firstName: 'Test',
          lastName: 'User',
          customerId: 'dev-customer-1',
        };
        return true;
      }
    }
    
    return super.canActivate(context);
  }
}