import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus, JobType } from './prisma-enums';

export { JobStatus, JobType };

export class CreateJobDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  payAmount!: number;

  @IsEnum(JobType)
  jobType!: JobType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  payAmount?: number;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class JobResponseDto {
  id!: string;
  jobNumber!: string;
  employeeId!: string;
  appointmentId?: string;
  title!: string;
  description?: string;
  payAmount!: number;
  status!: JobStatus;
  jobType!: JobType;
  dueDate?: Date;
  completedAt?: Date;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
  employee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  appointment?: {
    id: string;
    scheduledDate: Date | string;
    scheduledTime: string;
    serviceType: string;
  };
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    paidAt?: Date;
    paymentMethod: string;
  }>;
}

export class JobSummaryDto {
  totalJobs!: number;
  pendingJobs!: number;
  readyJobs!: number;
  paidJobs!: number;
  totalPayAmount!: number;
  pendingPayAmount!: number;
}
