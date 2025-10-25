// Job Types - Frontend Copy
// Note: Keep in sync with server/src/common/dto/job.dto.ts and Prisma schema

export enum JobStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  PARTIALLY_PAID = 'PARTIALLY_PAID'
}

export enum JobType {
  REGULAR = 'REGULAR',
  OVERTIME = 'OVERTIME',
  BONUS = 'BONUS',
  COMMISSION = 'COMMISSION',
  EXPENSE = 'EXPENSE',
  OTHER = 'OTHER'
}

export interface CreateJobDto {
  employeeId: string;
  title: string;
  description?: string;
  payAmount: number;
  jobType: JobType;
  dueDate?: string;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  payAmount?: number;
  status?: JobStatus;
  jobType?: JobType;
  dueDate?: string;
  completedAt?: string;
}

export interface JobResponseDto {
  id: string;
  jobNumber: string;
  employeeId: string;
  title: string;
  description?: string;
  payAmount: number;
  status: JobStatus;
  jobType: JobType;
  dueDate?: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface JobSummaryDto {
  totalJobs: number;
  pendingJobs: number;
  readyJobs: number;
  paidJobs: number;
  totalPayAmount: number;
  pendingPayAmount: number;
}
