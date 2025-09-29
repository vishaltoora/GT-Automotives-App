import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class InternalApiGuard implements CanActivate {
    private readonly logger;
    private readonly internalApiKey;
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
//# sourceMappingURL=internal-api.guard.d.ts.map