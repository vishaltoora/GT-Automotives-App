export interface DashboardStats {
    revenue: {
        value: number;
        change: number;
        trend: 'up' | 'down';
    };
    customers: {
        value: number;
        change: number;
        trend: 'up' | 'down';
    };
    vehicles: {
        value: number;
        change: number;
        trend: 'up' | 'down';
    };
    appointments: {
        value: number;
        change: number;
        trend: 'up' | 'down';
    };
    inventory: {
        value: number;
        lowStock: number;
    };
}
export declare const dashboardService: {
    getStats(): Promise<DashboardStats>;
};
//# sourceMappingURL=dashboard.service.d.ts.map