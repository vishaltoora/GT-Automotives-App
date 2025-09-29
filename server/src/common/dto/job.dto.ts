import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsDecimal } from 'class-validator';
import { JobStatus, JobType } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  employeeId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  payAmount!: number;

  @IsEnum(JobType)
  jobType!: JobType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  createdBy!: string;
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