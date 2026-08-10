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

  /**
   * Vacation pay percentage for this stub. Omit to use the employee's recorded
   * rate, falling back to the statutory minimum.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  vacationPayRate?: number;

  /**
   * Vacation earned this period. Omit to accrue the rate on `regularAmount`.
   *
   * Accepted as an override for the same reason the statutory deductions are:
   * a stub records what was actually paid and withheld, not what a formula
   * thinks it should have been.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  vacationPayAmount?: number;

  /**
   * Vacation held back this period. Omit to hold the whole accrual, which is
   * the normal case — the money is banked rather than paid out this cheque, so
   * the pair nets to zero. Send a smaller figure to pay some of it out.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  vacationPayHeld?: number;

  /**
   * Vacation taken out of the bank on this cheque.
   *
   * Cannot exceed what the employee has banked — the server checks it against
   * the running balance and refuses the stub otherwise, since paying out
   * vacation nobody earned is not a rounding problem.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  vacationPayPaidOut?: number;

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

  /**
   * The period's full gross, *including* any vacation accrual. Vacation pay is
   * insurable and pensionable, so estimating on the earnings alone
   * under-withholds EI, CPP and tax on every stub that accrues it.
   */
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

  /**
   * Whether raising this stub also marked the time entries behind it as paid.
   *
   * Only set on the response to creating a stub. False when the hours on the
   * stub did not match what the period held — an override, or a shift approved
   * while the form was open — in which case the entries were deliberately left
   * available rather than stamped for pay this stub does not cover. The
   * accountant is told so they can settle them explicitly.
   */
  hoursProcessed?: boolean;

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
  /** Regular earnings plus the vacation accrual. */
  grossPay: number;

  /** Percentage this stub accrued vacation at, e.g. 4. */
  vacationPayRate: number;
  /** Vacation earned this period, included in `grossPay`. */
  vacationPayAmount: number;
  /** The same amount held back, included in `totalWithholding`. */
  vacationPayHeld: number;
  /**
   * Vacation drawn from the bank on this cheque. Outside `grossPay` on purpose:
   * it was taxed when earned, so it reaches the employee after withholding.
   */
  vacationPayPaidOut: number;
  /**
   * Vacation still banked once this stub is accounted for. Runs across years —
   * vacation earned in December is usually taken the following spring — so
   * unlike the ytd figures it does not reset in January.
   */
  vacationPayBalance: number;

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
  /** Vacation earned so far this year — what the employee has banked. */
  ytdVacationPayAmount: number;
  ytdVacationPayHeld: number;
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
