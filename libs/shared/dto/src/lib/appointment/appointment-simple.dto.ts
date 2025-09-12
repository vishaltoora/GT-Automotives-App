import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  IsBoolean,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

// Simple Appointment DTOs without circular references
export class AppointmentDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsDateString()
  scheduledDate!: Date;

  @IsString()
  scheduledTime!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  duration!: number;

  @IsString()
  serviceType!: string;

  @IsString()
  status!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  reminderSent!: boolean;

  @IsDateString()
  createdAt!: Date;

  @IsDateString()
  updatedAt!: Date;
}

export class CreateAppointmentDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsDateString()
  scheduledDate!: Date;

  @IsString()
  scheduledTime!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  duration!: number;

  @IsString()
  serviceType!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  scheduledDate?: Date;

  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  reminderSent?: boolean;
}