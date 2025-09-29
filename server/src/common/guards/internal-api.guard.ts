import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiGuard.name);
  private readonly internalApiKey = process.env.INTERNAL_API_KEY;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Allow health checks without API key
    if (request.path === '/health' || request.path === '/') {
      return true;
    }

    // Skip in development if no API key is set
    if (process.env.NODE_ENV !== 'production' && !this.internalApiKey) {
      return true;
    }

    // Get API key from header
    const providedApiKey = request.headers['x-internal-api-key'];

    // Check if request is from our proxy (has the special header)
    const isFromProxy = request.headers['x-proxy-signature'] === 'gt-automotive-proxy';

    // Log the request origin for monitoring
    const origin = request.headers.origin || request.headers.referer || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    // In production, require either valid API key or proxy signature
    if (process.env.NODE_ENV === 'production') {
      if (!this.internalApiKey) {
        this.logger.error('INTERNAL_API_KEY not configured in production!');
        throw new UnauthorizedException('Server configuration error');
      }

      // Check if request has valid API key or is from our proxy
      if (providedApiKey === this.internalApiKey || isFromProxy) {
        return true;
      }

      // Log blocked attempt
      this.logger.warn(`🚫 Blocked direct API access attempt`, {
        path: request.path,
        method: request.method,
        origin,
        userAgent: userAgent.substring(0, 50),
        ip: request.ip,
        hasApiKey: !!providedApiKey,
        hasProxySignature: isFromProxy,
      });

      throw new UnauthorizedException('Direct API access not allowed. Please use the application interface.');
    }

    // In development, be more permissive but still validate if API key is set
    if (this.internalApiKey && providedApiKey !== this.internalApiKey && !isFromProxy) {
      this.logger.warn(`⚠️ Development: Invalid API key attempt`, {
        path: request.path,
        origin,
      });
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}