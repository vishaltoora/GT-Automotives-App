import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  ExpenseCategory,
  PurchaseCategory,
  PurchaseExpenseCategory,
  PurchaseInvoiceStatus,
} from './prisma-enums';

export { ExpenseCategory, PurchaseCategory, PurchaseExpenseCategory, PurchaseInvoiceStatus };

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
  category!: PurchaseCategory | ExpenseCategory | PurchaseExpenseCategory;
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
  month!: string;
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
  totalPurchases!: number;
  totalPurchaseAmount!: number;
  totalExpenses!: number;
  totalExpenseAmount!: number;
  combinedTotal!: number;
  paidTotal!: number;
  pendingTotal!: number;
  overdueTotal!: number;
  purchasesByCategory!: CategorySummaryDto[];
  expensesByCategory!: CategorySummaryDto[];
  topVendorsBySpending!: VendorSummaryDto[];
  monthlyTrends!: MonthlyTrendDto[];
  recurringExpenses!: RecurringExpenseSummaryDto[];
}
