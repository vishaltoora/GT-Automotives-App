import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from './decorators';
import { Type } from 'class-transformer';

// Enums for Appointment - using string values to match Prisma
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentType {
  AT_GARAGE = 'AT_GARAGE',
  MOBILE_SERVICE = 'MOBILE_SERVICE',
}

// Nested DTOs for appointment relations
export class PaymentEntryDto {
  @IsString()
  id!: string;

  @IsString()
  method!: string;

  @IsNumber()
  amount!: number;
}

export class AppointmentCustomerDto {
  @IsString()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class AppointmentVehicleDto {
  @IsString()
  id!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  year!: number;

  @IsOptional()
  @IsString()
  licensePlate?: string;
}

export class AppointmentEmployeeDto {
  @IsString()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  email!: string;
}

export class AppointmentEmployeeAssignmentDto {
  @IsString()
  id!: string;

  @IsString()
  employeeId!: string;

  @ValidateNested()
  @Type(() => AppointmentEmployeeDto)
  employee!: AppointmentEmployeeDto;
}

export class AppointmentInvoiceDto {
  @IsString()
  id!: string;

  @IsString()
  invoiceNumber!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsString()
  status!: string;
}

// Create DTO
export class CreateAppointmentDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsDateString()
  scheduledDate!: string;

  @IsString()
  scheduledTime!: string;

  @IsString()
  duration!: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Update DTO
export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Response DTO
export class AppointmentResponseDto {
  @IsString()
  id!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string; // Deprecated: Use employees array instead

  @IsString()
  scheduledDate!: Date | string;

  @IsString()
  scheduledTime!: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsNumber()
  duration!: number;

  @IsString()
  serviceType!: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  paymentAmount?: number; // Total amount paid

  @IsOptional()
  paymentBreakdown?: PaymentEntryDto[] | string; // Breakdown of payment methods (can be JSON string from DB)

  @IsOptional()
  @IsString()
  paymentNotes?: string;

  @IsOptional()
  @IsNumber()
  expectedAmount?: number; // Expected total amount for the service (for tracking partial payments)

  @IsOptional()
  @IsString()
  paymentDate?: Date | string; // Date when payment was actually processed/collected

  @IsBoolean()
  reminderSent!: boolean;

  @IsOptional()
  @IsString()
  bookedBy?: string;

  @IsString()
  createdAt!: Date;

  @IsString()
  updatedAt!: Date;

  // Nested relations
  @ValidateNested()
  @Type(() => AppointmentCustomerDto)
  customer!: AppointmentCustomerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentVehicleDto)
  vehicle?: AppointmentVehicleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentEmployeeDto)
  employee?: AppointmentEmployeeDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentEmployeeAssignmentDto)
  employees?: AppointmentEmployeeAssignmentDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentInvoiceDto)
  invoice?: AppointmentInvoiceDto;
}

// Legacy type alias for backward compatibility
export type PaymentEntry = PaymentEntryDto;
