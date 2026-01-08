import { IsDateString, IsOptional } from 'class-validator';

export class TaxReportFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class MonthlyTaxBreakdownDto {
  month!: string; // YYYY-MM format
  invoiceCount!: number;
  gstCollected!: number;
  pstCollected!: number;
  totalTaxCollected!: number;
}

export class TaxReportResponseDto {
  // Summary statistics
  totalInvoices!: number;
  totalGstCollected!: number;
  totalPstCollected!: number;
  totalTaxCollected!: number;

  // Monthly trends
  monthlyBreakdown!: MonthlyTaxBreakdownDto[];
}

// GST Paid on Purchase & Expense Report DTOs
export class MonthlyGstPaidBreakdownDto {
  month!: string; // YYYY-MM format
  purchaseCount!: number;
  expenseCount!: number;
  purchaseGstPaid!: number;
  purchasePstPaid!: number;
  purchaseHstPaid!: number;
  expenseGstPaid!: number;
  expensePstPaid!: number;
  expenseHstPaid!: number;
  totalGstPaid!: number;
  totalPstPaid!: number;
  totalHstPaid!: number;
  totalTaxPaid!: number;
}

export class GstPaidReportResponseDto {
  // Summary statistics
  totalPurchaseInvoices!: number;
  totalExpenseInvoices!: number;
  totalInvoices!: number;

  // GST Paid
  purchaseGstPaid!: number;
  expenseGstPaid!: number;
  totalGstPaid!: number;

  // PST Paid
  purchasePstPaid!: number;
  expensePstPaid!: number;
  totalPstPaid!: number;

  // HST Paid
  purchaseHstPaid!: number;
  expenseHstPaid!: number;
  totalHstPaid!: number;

  // Total Tax Paid
  totalTaxPaid!: number;

  // Monthly trends
  monthlyBreakdown!: MonthlyGstPaidBreakdownDto[];
}
