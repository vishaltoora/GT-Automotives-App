import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    }>;
    checkDetailed(): Promise<{
        database: string;
        memory: {
            used: number;
            total: number;
            unit: string;
        };
        version: string;
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    }>;
}
//# sourceMappingURL=health.controller.d.ts.map