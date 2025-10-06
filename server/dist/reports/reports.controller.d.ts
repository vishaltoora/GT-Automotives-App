import { ReportsService } from './reports.service';
import { ExpenseReportFilterDto, ExpenseReportResponseDto } from '../common/dto/expense-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getExpenseReport(filterDto: ExpenseReportFilterDto): Promise<ExpenseReportResponseDto>;
}
//# sourceMappingURL=reports.controller.d.ts.map