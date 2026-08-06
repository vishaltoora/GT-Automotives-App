import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType, PartialType } from './utils/mapped-types';
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
 * Statutory deductions are still supplied here rather than recomputed on save.
 * They are suggested by the deduction estimate endpoint using the CRA formulas
 * for the pay date's year, but the accountant can type over any of them, and
 * what they confirm is what gets stored — a stub must record what was actually
 * withheld, not what a formula thinks should have been.
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
 * Correct a stub that has already been issued.
 *
 * Every input is optional — send only what is wrong. The employee is not
 * among them: a stub belongs to one person's year-to-date record, and moving
 * it to another would corrupt both. Re-raise it against the right employee
 * instead.
 *
 * Editing an earlier stub shifts the running totals on every later one, so the
 * server rewrites that employee's year-to-date chain rather than leaving the
 * later documents disagreeing with this one.
 */
export class UpdatePayStubDto extends PartialType(
  OmitType(CreatePayStubDto, ['employeeId'] as const)
) {}

/** Pay frequencies the deduction calculator supports, as periods per year. */
export const PAY_PERIODS_PER_YEAR = [52, 26, 24, 12] as const;
export type PayPeriodsPerYear = (typeof PAY_PERIODS_PER_YEAR)[number];

/**
 * Ask what CPP, EI and income tax should come off a given gross.
 *
 * The employee and pay date are needed as well as the amount: contributions
 * stop at annual maximums, so the answer depends on what has already been
 * withheld from this employee earlier in the same year.
 */
export class PayStubDeductionEstimateRequestDto {
  @IsString()
  employeeId!: string;

  /** Determines the tax year, and therefore which rate table applies. */
  @IsDateString()
  payDate!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  grossPay!: number;

  /**
   * Pay periods in the year. Sent explicitly because the CRA formulas
   * annualize the period's pay, so the frequency changes every figure and
   * cannot be safely guessed from the dates alone.
   */
  @IsNumber()
  @IsIn([...PAY_PERIODS_PER_YEAR])
  @Type(() => Number)
  payPeriodsPerYear!: PayPeriodsPerYear;
}

/**
 * Suggested statutory deductions, with enough context for the accountant to
 * judge whether to accept them.
 */
export interface PayStubDeductionEstimateDto {
  /** False when no CRA rate table is held for the pay date's year. */
  supported: boolean;
  taxYear: number;
  province: string;
  payPeriodsPerYear: number;

  ei: number;
  cpp: number;
  /** The CPP2 slice of `cpp`, non-zero only above the year's YMPE. */
  cpp2: number;
  incomeTax: number;
  federalTax: number;
  provincialTax: number;
  annualTaxableIncome: number;

  /** This period's contribution was clipped by the annual maximum. */
  cppMaxedOut: boolean;
  eiMaxedOut: boolean;

  /** Year-to-date figures the estimate was based on. */
  ytdGrossPay: number;
  ytdCpp: number;
  ytdEi: number;

  /** Plain-language caveats to show alongside the suggested figures. */
  assumptions: string[];
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
  /** Company details as they stood when the stub was raised. */
  companyBusinessType?: string;
  companyRegistrationNumber?: string;
  companyPhone?: string;
  companyEmail?: string;
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
