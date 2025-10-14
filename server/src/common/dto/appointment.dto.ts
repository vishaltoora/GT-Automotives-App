import { IsString, IsOptional, IsDate, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @Type(() => Date)
  @IsDate()
  scheduledDate!: Date;

  @IsString()
  scheduledTime!: string; // "09:00" format (24-hour)

  @IsInt()
  @Min(15) // Minimum 15 minutes
  @Max(480) // Maximum 8 hours
  duration!: number;

  @IsString()
  serviceType!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentDto implements Partial<CreateAppointmentDto> {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  duration?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  // Internal field for recalculated end time (not validated from request)
  endTime?: string;
}

export class AppointmentQueryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

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
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @IsOptional()
  @IsString()
  employeeId?: string; // If null, return all employees
}
