import { PrismaService } from '@gt-automotive/database';
export declare class HealthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    }>;
    checkDetailed(): Promise<{
        database: {
            status: string;
            connected: boolean;
            error: string | undefined;
        };
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
//# sourceMappingURL=health.service.d.ts.map