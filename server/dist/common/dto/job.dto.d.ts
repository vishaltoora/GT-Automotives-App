import { JobStatus, JobType } from '@prisma/client';
export declare class CreateJobDto {
    employeeId: string;
    appointmentId?: string;
    title: string;
    description?: string;
    payAmount: number;
    jobType: JobType;
    status?: JobStatus;
    dueDate?: string;
    completedAt?: string;
}
export declare class UpdateJobDto {
    title?: string;
    description?: string;
    payAmount?: number;
    status?: JobStatus;
    jobType?: JobType;
    dueDate?: string;
    completedAt?: string;
}
export declare class JobResponseDto {
    id: string;
    jobNumber: string;
    employeeId: string;
    appointmentId?: string;
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
    appointment?: {
        id: string;
        scheduledDate: Date;
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
export declare class JobSummaryDto {
    totalJobs: number;
    pendingJobs: number;
    readyJobs: number;
    paidJobs: number;
    totalPayAmount: number;
    pendingPayAmount: number;
}
//# sourceMappingURL=job.dto.d.ts.map