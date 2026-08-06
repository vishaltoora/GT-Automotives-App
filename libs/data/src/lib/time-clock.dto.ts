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
 * Approved hours and gross pay for one employee over a period, as returned by
 * the read-only `GET /api/time-clock/payroll-hours` endpoint. This is what the
 * pay stub form pre-fills from — reading it never marks entries as processed.
 *
 * `hours` counts every approved entry in the period, whether or not payroll has
 * already been processed for it, so a stub raised after payroll runs still
 * reports the period correctly. `processedHours` is the subset already stamped,
 * exposed so the UI can say so rather than silently conflating the two.
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
