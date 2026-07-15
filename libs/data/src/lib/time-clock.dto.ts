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
