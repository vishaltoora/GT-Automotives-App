import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PurchaseCategory, ExpenseCategory, PurchaseInvoiceStatus } from '@prisma/client';

export class ExpenseReportFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsEnum(PurchaseInvoiceStatus)
  @IsOptional()
  status?: PurchaseInvoiceStatus;
}

export class CategorySummaryDto {
  category!: PurchaseCategory | ExpenseCategory;
  count!: number;
  totalAmount!: number;
  paidAmount!: number;
  pendingAmount!: number;
  overdueAmount!: number;
}

export class VendorSummaryDto {
  vendorId?: string;
  vendorName!: string;
  count!: number;
  totalAmount!: number;
  paidAmount!: number;
  pendingAmount!: number;
}

export class MonthlyTrendDto {
  month!: string; // YYYY-MM format
  purchaseCount!: number;
  purchaseTotal!: number;
  expenseCount!: number;
  expenseTotal!: number;
  combinedTotal!: number;
}

export class RecurringExpenseSummaryDto {
  id!: string;
  vendorName!: string;
  description!: string;
  category!: ExpenseCategory;
  amount!: number;
  recurringPeriod!: string;
  lastPaymentDate?: Date;
  nextDueDate?: Date;
  status!: PurchaseInvoiceStatus;
}

export class ExpenseReportResponseDto {
  // Summary statistics
  totalPurchases!: number;
  totalPurchaseAmount!: number;
  totalExpenses!: number;
  totalExpenseAmount!: number;
  combinedTotal!: number;

  // Payment status breakdown
  paidTotal!: number;
  pendingTotal!: number;
  overdueTotal!: number;

  // Category breakdowns
  purchasesByCategory!: CategorySummaryDto[];
  expensesByCategory!: CategorySummaryDto[];

  // Vendor analysis
  topVendorsBySpending!: VendorSummaryDto[];

  // Monthly trends
  monthlyTrends!: MonthlyTrendDto[];

  // Recurring expenses
  recurringExpenses!: RecurringExpenseSummaryDto[];
}
