import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

// Enums for Appointment - using string values to match Prisma
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

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

export class AppointmentResponseDto {
  id!: string;
  customerId!: string;
  vehicleId?: string;
  employeeId?: string;
  scheduledDate!: Date;
  scheduledTime!: string;
  duration!: string;
  status!: AppointmentStatus;
  serviceType?: string;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  employee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}
