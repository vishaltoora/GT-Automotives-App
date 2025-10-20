export interface PeriodAnalytics {
    count: number;
    total: number;
}
export interface AnalyticsData {
    mtd: {
        purchases: PeriodAnalytics;
        expenses: PeriodAnalytics;
        salesInvoices: PeriodAnalytics;
        combined: PeriodAnalytics;
    };
    ytd: {
        purchases: PeriodAnalytics;
        expenses: PeriodAnalytics;
        salesInvoices: PeriodAnalytics;
        combined: PeriodAnalytics;
    };
}
declare class AnalyticsService {
    getAnalytics(): Promise<AnalyticsData>;
}
declare const analyticsService: AnalyticsService;
export default analyticsService;
//# sourceMappingURL=analytics.service.d.ts.map