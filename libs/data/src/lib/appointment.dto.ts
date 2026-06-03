import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus, AppointmentType } from './prisma-enums';

export { AppointmentStatus, AppointmentType };

// Nested DTOs for appointment relations
export class PaymentEntryDto {
  @IsString()
  id!: string;

  @IsString()
  method!: string;

  @IsNumber()
  @Type(() => Number)
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
  @Type(() => Number)
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[];

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-18)',
  })
  scheduledDate!: string;

  @IsString()
  scheduledTime!: string;

  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  duration!: number;

  @IsString()
  serviceType!: string;

  @IsEnum(AppointmentType)
  appointmentType!: AppointmentType;

  @IsOptional()
  @IsString()
  serviceAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Update DTO
export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-18)',
  })
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  duration?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @IsOptional()
  @IsString()
  serviceAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paymentAmount?: number;

  @IsOptional()
  paymentBreakdown?: PaymentEntryDto[];

  @IsOptional()
  @IsString()
  paymentNotes?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expectedAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  productSaleAmount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productSaleItems?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completionEmployeeIds?: string[];

  @IsOptional()
  @IsString()
  endTime?: string;
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
  @Type(() => Number)
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
  @Type(() => Number)
  paymentAmount?: number; // Total amount paid

  @IsOptional()
  paymentBreakdown?: PaymentEntryDto[] | string; // Breakdown of payment methods (can be JSON string from DB)

  @IsOptional()
  @IsString()
  paymentNotes?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expectedAmount?: number; // Expected total amount for the service (for tracking partial payments)

  @IsOptional()
  @IsString()
  paymentDate?: Date | string; // Date when payment was actually processed/collected

  @IsBoolean()
  reminderSent!: boolean;

  @IsOptional()
  @IsString()
  bookedBy?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentEmployeeDto)
  bookedByUser?: AppointmentEmployeeDto;

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

export class AppointmentQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

export class CalendarQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-18)',
  })
  startDate!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-18)',
  })
  endDate!: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class PaymentDateQueryDto {
  @IsString()
  paymentDate!: string;
}

export class CreateETransferInvoiceDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  serviceAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tipAmount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completionEmployeeIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  productSaleAmount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productSaleItems?: string[];
}

export class CreateSquareDeviceInvoiceDto extends CreateETransferInvoiceDto {
  @IsOptional()
  @IsEnum(['CREDIT_CARD', 'DEBIT_CARD'])
  cardType?: 'CREDIT_CARD' | 'DEBIT_CARD';
}

// Legacy type alias for backward compatibility
export type PaymentEntry = PaymentEntryDto;
