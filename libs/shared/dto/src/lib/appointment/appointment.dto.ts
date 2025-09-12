import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  ValidateNested,
  IsBoolean,
  IsPositive,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

// Appointment DTOs
export class AppointmentDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  customerId!: string;

  @ValidateNested()
  @Type(() => CustomerReferenceDto)
  @IsOptional()
  customer?: CustomerReferenceDto;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ValidateNested()
  @Type(() => VehicleReferenceDto)
  @IsOptional()
  vehicle?: VehicleReferenceDto;

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

// Reference DTOs to avoid circular dependencies
export class CustomerReferenceDto {
  @IsUUID()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class VehicleReferenceDto {
  @IsUUID()
  id!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  @Type(() => Number)
  year!: number;

  @IsString()
  @IsOptional()
  licensePlate?: string;
}