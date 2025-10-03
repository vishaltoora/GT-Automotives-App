import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
//# sourceMappingURL=dashboard.controller.d.ts.map