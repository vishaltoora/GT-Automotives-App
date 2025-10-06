import { PurchaseCategory, ExpenseCategory, PurchaseInvoiceStatus } from '@prisma/client';
export declare class ExpenseReportFilterDto {
    startDate?: string;
    endDate?: string;
    vendorId?: string;
    status?: PurchaseInvoiceStatus;
}
export declare class CategorySummaryDto {
    category: PurchaseCategory | ExpenseCategory;
    count: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
}
export declare class VendorSummaryDto {
    vendorId?: string;
    vendorName: string;
    count: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
}
export declare class MonthlyTrendDto {
    month: string;
    purchaseCount: number;
    purchaseTotal: number;
    expenseCount: number;
    expenseTotal: number;
    combinedTotal: number;
}
export declare class RecurringExpenseSummaryDto {
    id: string;
    vendorName: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    recurringPeriod: string;
    lastPaymentDate?: Date;
    nextDueDate?: Date;
    status: PurchaseInvoiceStatus;
}
export declare class ExpenseReportResponseDto {
    totalPurchases: number;
    totalPurchaseAmount: number;
    totalExpenses: number;
    totalExpenseAmount: number;
    combinedTotal: number;
    paidTotal: number;
    pendingTotal: number;
    overdueTotal: number;
    purchasesByCategory: CategorySummaryDto[];
    expensesByCategory: CategorySummaryDto[];
    topVendorsBySpending: VendorSummaryDto[];
    monthlyTrends: MonthlyTrendDto[];
    recurringExpenses: RecurringExpenseSummaryDto[];
}
//# sourceMappingURL=expense-report.dto.d.ts.map