import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiGuard.name);
  private readonly internalApiKey = process.env.INTERNAL_API_KEY || '7bf4b1da149eec37a7f733fd84d4a7eead6b65e119770f554de36ecce932c3a4c46e20bb03ef075c86fa7b067ea2b3c50b59d5d1dbfd74594505ca50b6da180d';

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Allow health checks without API key
    if (request.path === '/health' || request.path === '/') {
      return true;
    }

    // In development, allow all requests
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    // Get API key from header (sent by reverse proxy)
    const providedApiKey = request.headers['x-internal-api-key'];

    // Validate the API key
    if (providedApiKey && providedApiKey === this.internalApiKey) {
      // Valid API key from reverse proxy
      return true;
    }

    // Log the request for security monitoring
    const origin = request.headers.origin || request.headers.referer || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    const forwardedFor = request.headers['x-forwarded-for'] || request.ip;

    // Log blocked attempt with details
    this.logger.warn(`🚫 SECURITY: Blocked unauthorized API access attempt`, {
      path: request.path,
      method: request.method,
      origin,
      userAgent: userAgent.substring(0, 100),
      ip: forwardedFor,
      hasApiKey: !!providedApiKey,
      apiKeyMatch: providedApiKey === this.internalApiKey,
    });

    throw new UnauthorizedException('Direct API access not allowed. Please use the application interface.');
  }
}