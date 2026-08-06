import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayType } from './prisma-enums';
import { EmployeeSummaryDto } from './time-clock.dto';

/**
 * What the accountant fills in to raise a pay stub.
 *
 * Only the inputs are accepted here. Every derived figure — regular amount,
 * gross, total withholding, net, and all the year-to-date columns — is computed
 * server-side and never taken from the client, so the arithmetic on a printed
 * stub is always internally consistent.
 *
 * Statutory deductions are entered, not calculated: EI and CPP rates are
 * year-specific and getting them wrong has real consequences, so the system
 * stores what the accountant supplies rather than guessing.
 */
export class CreatePayStubDto {
  @IsString()
  employeeId!: string;

  /** Pay period start, as a calendar date (YYYY-MM-DD). */
  @IsDateString()
  periodStart!: string;

  /** Pay period end, as a calendar date (YYYY-MM-DD). */
  @IsDateString()
  periodEnd!: string;

  /** The date the employee is paid, as a calendar date (YYYY-MM-DD). */
  @IsDateString()
  payDate!: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  payRate?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  regularHours!: number;

  /**
   * Gross earnings for the period. Sent explicitly rather than derived from
   * hours × rate so the accountant can correct it — a salaried employee has no
   * meaningful hourly product, and hourly pay may include agreed adjustments.
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  regularAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  eiAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cppAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  incomeTaxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  otherDeductions?: number;

  @IsOptional()
  @IsString()
  otherDeductionsLabel?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * A pay stub as issued. Every printed figure is stored, so re-rendering the
 * document later reproduces the same numbers no matter what has changed in
 * payroll since.
 */
export interface PayStubDto {
  id: string;
  employeeId: string;
  employee?: EmployeeSummaryDto;

  periodStart: string;
  periodEnd: string;
  payDate: string;

  companyName: string;
  companyAddress?: string;
  employeeName: string;
  position?: string;
  payRate?: number;
  payType: PayType;

  regularHours: number;
  regularAmount: number;
  grossPay: number;

  eiAmount: number;
  cppAmount: number;
  incomeTaxAmount: number;
  otherDeductions: number;
  otherDeductionsLabel?: string;
  totalWithholding: number;
  netPay: number;

  ytdHours: number;
  ytdRegularAmount: number;
  ytdGrossPay: number;
  ytdEiAmount: number;
  ytdCppAmount: number;
  ytdIncomeTaxAmount: number;
  ytdOtherDeductions: number;
  ytdWithholding: number;
  ytdNetPay: number;

  notes?: string;
  generatedBy: string;
  createdAt: string;
}
