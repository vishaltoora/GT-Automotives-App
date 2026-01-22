import { ReportsService } from './reports.service';
import { ExpenseReportFilterDto, ExpenseReportResponseDto } from '../common/dto/expense-report.dto';
import { TaxReportFilterDto, TaxReportResponseDto, GstPaidReportResponseDto } from '../common/dto/tax-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getExpenseReport(filterDto: ExpenseReportFilterDto): Promise<ExpenseReportResponseDto>;
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
    getPurchaseReport(filterDto: ExpenseReportFilterDto): Promise<ExpenseReportResponseDto>;
    getTaxReport(filterDto: TaxReportFilterDto): Promise<TaxReportResponseDto>;
    getGstPaidReport(filterDto: TaxReportFilterDto): Promise<GstPaidReportResponseDto>;
}
//# sourceMappingURL=reports.controller.d.ts.map