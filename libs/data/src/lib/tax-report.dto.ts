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
  month!: string;
  invoiceCount!: number;
  gstCollected!: number;
  pstCollected!: number;
  totalTaxCollected!: number;
}

export class TaxReportResponseDto {
  totalInvoices!: number;
  totalGstCollected!: number;
  totalPstCollected!: number;
  totalTaxCollected!: number;
  monthlyBreakdown!: MonthlyTaxBreakdownDto[];
}

export class MonthlyGstPaidBreakdownDto {
  month!: string;
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
  totalPurchaseInvoices!: number;
  totalExpenseInvoices!: number;
  totalInvoices!: number;
  purchaseGstPaid!: number;
  expenseGstPaid!: number;
  totalGstPaid!: number;
  purchasePstPaid!: number;
  expensePstPaid!: number;
  totalPstPaid!: number;
  purchaseHstPaid!: number;
  expenseHstPaid!: number;
  totalHstPaid!: number;
  totalTaxPaid!: number;
  monthlyBreakdown!: MonthlyGstPaidBreakdownDto[];
}
