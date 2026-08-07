import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BreakType,
  PayType,
  PayrollAdjustmentType,
  TimeEntrySource,
  TimeEntryStatus,
} from './prisma-enums';

export {
  BreakType,
  PayType,
  PayrollAdjustmentType,
  TimeEntrySource,
  TimeEntryStatus,
};

export class UpsertEmployeeCompensationDto {
  @IsEnum(PayType)
  payType!: PayType;

  /**
   * Job title as it should read on this employee's pay stubs. Optional — the
   * stub omits the line when there is none.
   */
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  annualSalary?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expectedWeeklyHours?: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}

export class ClockInDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StartBreakDto {
  @IsOptional()
  @IsEnum(BreakType)
  breakType?: BreakType;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockOutDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTimeEntryDto {
  @IsOptional()
  @IsDateString()
  clockInAt?: string;

  @IsOptional()
  @IsDateString()
  clockOutAt?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  breakMinutes?: number;

  @IsString()
  adjustmentReason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTimeEntryDto {
  @IsString()
  employeeId!: string;

  @IsDateString()
  clockInAt!: string;

  @IsDateString()
  clockOutAt!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  breakMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreatePayrollAdjustmentDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsEnum(PayrollAdjustmentType)
  type?: PayrollAdjustmentType;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  effectiveDate!: string;
}

export class ProcessPayrollDto {
  @IsString()
  employeeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export interface EmployeeSummaryDto {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface EmployeeCompensationDto {
  id: string;
  employeeId: string;
  /** Job title for pay stubs, e.g. "Tire Technician". */
  position?: string;
  payType: PayType;
  hourlyRate?: number;
  annualSalary?: number;
  expectedWeeklyHours?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreakEntryDto {
  id: string;
  timeEntryId: string;
  breakType: BreakType;
  startAt: string;
  endAt?: string;
  isPaid: boolean;
  notes?: string;
  minutes: number;
}

export interface TimeEntryDto {
  id: string;
  employeeId: string;
  clockInAt: string;
  clockOutAt?: string;
  status: TimeEntryStatus;
  source: TimeEntrySource;
  notes?: string;
  adjustedBy?: string;
  adjustmentReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  payrollProcessedBy?: string;
  payrollProcessedAt?: string;
  grossMinutes: number;
  unpaidBreakMinutes: number;
  paidMinutes: number;
  employee?: EmployeeSummaryDto;
  breaks: BreakEntryDto[];
}

export interface PayrollAdjustmentDto {
  id: string;
  employeeId: string;
  type: PayrollAdjustmentType;
  amount: number;
  reason: string;
  notes?: string;
  effectiveDate: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  employee?: EmployeeSummaryDto;
}

export interface PayrollSummaryEmployeeDto {
  employee: EmployeeSummaryDto;
  compensation?: EmployeeCompensationDto;
  approvedHours: number;
  pendingHours: number;
  processedHours: number;
  unpaidApprovedHours: number;
  hourlyPay: number;
  salaryPay: number;
  bonusPay: number;
  grossPay: number;
}

export interface PayrollSummaryDto {
  startDate: string;
  endDate: string;
  employees: PayrollSummaryEmployeeDto[];
  totals: {
    approvedHours: number;
    pendingHours: number;
    processedHours: number;
    unpaidApprovedHours: number;
    hourlyPay: number;
    salaryPay: number;
    bonusPay: number;
    grossPay: number;
  };
}

/**
 * One employee's hours for a pay period, as shown on a time clock card.
 *
 * Approved and unapproved are separate figures rather than a total and a
 * remainder: only approved hours are payable, and the gap between the two is
 * what has to be chased before payroll runs.
 */
export interface PayPeriodHoursDto {
  employeeId: string;
  employee: EmployeeSummaryDto;
  /** The employee's role, for labelling the card. */
  role?: string;
  startDate: string;
  endDate: string;
  /** Payable hours, including hours already paid out. */
  approvedHours: number;
  /** The part of `approvedHours` that payroll has already paid. */
  processedHours: number;
  /** Finished shifts nobody has approved yet. */
  unapprovedHours: number;
  entryCount: number;
  /** Shifts still running, whose hours are in neither total yet. */
  openEntryCount: number;
}

/**
 * Approved hours and gross pay for one employee over a period, as returned by
 * the read-only `GET /api/time-clock/payroll-hours` endpoint. Reading it never
 * marks entries as processed.
 *
 * What `hours` counts depends on the caller's `unprocessedOnly` flag. The pay
 * stub form sets it, so it sees only hours no stub has paid yet — raising the
 * stub is what pays them. The accountant's hours view leaves it off and gets
 * the whole period, with `processedHours` as the subset already paid so the UI
 * can say so rather than conflating the two.
 */
export interface PayrollHoursDto {
  employeeId: string;
  employee: EmployeeSummaryDto;
  startDate: string;
  endDate: string;
  entryCount: number;
  hours: number;
  processedHours: number;
  /** Absent when the employee has no active compensation record. */
  payType?: PayType;
  hasCompensation: boolean;
  /** Job title from the compensation record, for the pay stub. */
  position?: string;
  /** Zero for salaried employees — read `salaryPay` instead. */
  hourlyRate: number;
  /** Annual salary prorated across the period; zero for hourly employees. */
  salaryPay: number;
  grossPay: number;
}
