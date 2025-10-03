import { PrismaService } from '@gt-automotive/database';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        revenue: {
            value: number;
            change: number;
            trend: string;
        };
        customers: {
            value: number;
            change: number;
            trend: string;
        };
        vehicles: {
            value: number;
            change: number;
            trend: string;
        };
        appointments: {
            value: number;
            change: number;
            trend: string;
        };
        inventory: {
            value: number;
            lowStock: number;
        };
    }>;
}
//# sourceMappingURL=dashboard.service.d.ts.map