import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus, PaymentMethod } from './prisma-enums';

/**
 * Sales report: customer invoices in a date range, one row per invoice, with
 * per-column totals. Run by admins and accountants.
 */
export class SalesReportFilterDto {
  /** Business calendar date (YYYY-MM-DD), inclusive. */
  @IsDateString()
  startDate!: string;

  /** Business calendar date (YYYY-MM-DD), inclusive of the whole day. */
  @IsDateString()
  endDate!: string;

  /** Omit to include every status. */
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}

export class SalesReportRowDto {
  invoiceId!: string;
  invoiceNumber!: string;
  /** Business calendar date in YYYY-MM-DD form — already timezone-resolved. */
  date!: string;
  /** Line items summarised, falling back to notes then the customer name. */
  description!: string;
  subtotal!: number;
  gst!: number;
  pst!: number;
  netTotal!: number;
  /** Null when the invoice has not been paid yet. */
  paymentMethod!: PaymentMethod | null;
  status!: InvoiceStatus;
}

/** Column totals across every row in the report. */
export class SalesReportTotalsDto {
  subtotal!: number;
  gst!: number;
  pst!: number;
  netTotal!: number;
}

export class SalesReportResponseDto {
  startDate!: string;
  endDate!: string;
  invoiceCount!: number;
  rows!: SalesReportRowDto[];
  totals!: SalesReportTotalsDto;
}
