import { ExpenseReportFilterDto, ExpenseReportResponseDto } from '../common/dto/expense-report.dto';
export declare class ReportsService {
    private prisma;
    getExpenseReport(filterDto: ExpenseReportFilterDto): Promise<ExpenseReportResponseDto>;
    private getPurchasesByCategory;
    private getExpensesByCategory;
    private getTopVendorsBySpending;
    private calculateMonthlyTrends;
    private getRecurringExpenses;
    private calculateNextDueDate;
}
//# sourceMappingURL=reports.service.d.ts.map