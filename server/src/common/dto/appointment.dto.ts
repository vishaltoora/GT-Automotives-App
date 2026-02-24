import { IsString, IsOptional, IsInt, IsEnum, Min, Max, IsArray, IsNumber, IsPositive } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '@prisma/client';
import { IsDateString, IsOptionalDateString } from '../decorators/date-validation.decorator';

export class CreateAppointmentDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string; // Deprecated: Use employeeIds instead

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[]; // Multiple employee IDs

  @IsDateString()
  scheduledDate!: string; // YYYY-MM-DD format - keep as string to avoid timezone conversion

  @IsString()
  scheduledTime!: string; // "09:00" format (24-hour)

  @IsInt()
  @Min(15) // Minimum 15 minutes
  @Max(480) // Maximum 8 hours
  duration!: number;

  @IsString()
  serviceType!: string;

  @IsEnum(AppointmentType)
  appointmentType!: AppointmentType;

  @IsOptional()
  @IsString()
  serviceAddress?: string; // Required for MOBILE_SERVICE appointments (validated in service)

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentDto implements Partial<CreateAppointmentDto> {
  @IsOptional()
  @IsString()
  employeeId?: string; // Deprecated: Use employeeIds instead

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[]; // Multiple employee IDs

  @IsOptionalDateString()
  scheduledDate?: string; // YYYY-MM-DD format - keep as string to avoid timezone conversion

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  duration?: number;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @IsOptional()
  @IsString()
  serviceAddress?: string; // Address for mobile service appointments

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  paymentAmount?: number;

  @IsOptional()
  paymentBreakdown?: any; // JSON array of payment entries

  @IsOptional()
  @IsString()
  paymentNotes?: string;

  @IsOptional()
  expectedAmount?: number;

  // Internal field for recalculated end time (not validated from request)
  endTime?: string;
}

export class AppointmentQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD format - keep as string to avoid timezone conversion

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD format - keep as string to avoid timezone conversion

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
  @IsDateString()
  startDate!: string; // YYYY-MM-DD format - keep as string to avoid timezone conversion

  @IsDateString()
  endDate!: string; // YYYY-MM-DD format - keep as string to avoid timezone conversion

  @IsOptional()
  @IsString()
  employeeId?: string; // If null, return all employees
}

export class PaymentDateQueryDto {
  @IsString()
  paymentDate!: string; // Filter by payment processing date in YYYY-MM-DD format (for daily cash reports)
}

export class CreateETransferInvoiceDto {
  @IsNumber()
  @IsPositive()
  serviceAmount!: number; // Base service amount before taxes
}
