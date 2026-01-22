import { ExpenseReportFilterDto, ExpenseReportResponseDto } from '../common/dto/expense-report.dto';
import { TaxReportFilterDto, TaxReportResponseDto, GstPaidReportResponseDto } from '../common/dto/tax-report.dto';
export declare class ReportsService {
    private prisma;
    getExpenseReport(filterDto: ExpenseReportFilterDto): Promise<ExpenseReportResponseDto>;
    private getPurchasesByCategory;
    private getExpensesByCategory;
    private getTopVendorsBySpending;
    private calculateMonthlyTrends;
    private getRecurringExpenses;
    private calculateNextDueDate;
    getAnalytics(): Promise<{
        mtd: {
            purchases: {
                count: number;
                total: number;
            };
            expenses: {
                count: number;
                total: number;
            };
            salesInvoices: {
                count: number;
                total: number;
            };
            combined: {
                count: number;
                total: number;
            };
        };
        ytd: {
            purchases: {
                count: number;
                total: number;
            };
            expenses: {
                count: number;
                total: number;
            };
            salesInvoices: {
                count: number;
                total: number;
            };
            combined: {
                count: number;
                total: number;
            };
        };
    }>;
    getTaxReport(filterDto: TaxReportFilterDto): Promise<TaxReportResponseDto>;
    private calculateMonthlyTaxBreakdown;
    getGstPaidReport(filterDto: TaxReportFilterDto): Promise<GstPaidReportResponseDto>;
    private calculateMonthlyGstPaidBreakdown;
}
//# sourceMappingURL=reports.service.d.ts.map