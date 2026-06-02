import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum PayType {
  HOURLY = 'HOURLY',
  SALARIED = 'SALARIED',
}

export enum TimeEntryStatus {
  OPEN = 'OPEN',
  ON_BREAK = 'ON_BREAK',
  CLOCKED_OUT = 'CLOCKED_OUT',
  APPROVED = 'APPROVED',
  ADJUSTED = 'ADJUSTED',
  VOIDED = 'VOIDED',
}

export enum TimeEntrySource {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

export enum BreakType {
  MEAL = 'MEAL',
  REST = 'REST',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER',
}

export enum PayrollAdjustmentType {
  BONUS = 'BONUS',
  REIMBURSEMENT = 'REIMBURSEMENT',
  DEDUCTION = 'DEDUCTION',
  OTHER = 'OTHER',
}

export class UpsertEmployeeCompensationDto {
  @IsEnum(PayType)
  payType!: PayType;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  annualSalary?: number;

  @IsOptional()
  @IsNumber()
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

  @IsString()
  adjustmentReason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePayrollAdjustmentDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsEnum(PayrollAdjustmentType)
  type?: PayrollAdjustmentType;

  @IsNumber()
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
