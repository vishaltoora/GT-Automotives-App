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
