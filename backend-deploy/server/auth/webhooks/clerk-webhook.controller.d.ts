import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
export declare class ClerkWebhookController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    handleClerkWebhook(body: any, svixId: string, svixTimestamp: string, svixSignature: string): Promise<{
        received: boolean;
        message: string;
    } | {
        received: boolean;
        message?: undefined;
    }>;
    private handleUserEvent;
    private handleUserDeleted;
}
//# sourceMappingURL=clerk-webhook.controller.d.ts.map