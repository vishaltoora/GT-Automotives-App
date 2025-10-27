import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobSummaryDto } from '../common/dto/job.dto';
import { JobStatus, JobType } from '@prisma/client';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.JobStatus;
        createdBy: string;
        employeeId: string;
        jobNumber: string;
        title: string;
        payAmount: import(".prisma/client/runtime/library").Decimal;
        jobType: import("@prisma/client").$Enums.JobType;
        dueDate: Date | null;
        completedAt: Date | null;
    }>;
    findAll(employeeId?: string, status?: JobStatus, jobType?: JobType, startDate?: string, endDate?: string): Promise<JobResponseDto[]>;
    getJobSummary(employeeId?: string): Promise<JobSummaryDto>;
    findPendingJobs(): Promise<JobResponseDto[]>;
    findReadyForPayment(): Promise<JobResponseDto[]>;
    findByEmployee(employeeId: string): Promise<JobResponseDto[]>;
    findOne(id: string): Promise<JobResponseDto>;
    update(id: string, updateJobDto: UpdateJobDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.JobStatus;
        createdBy: string;
        employeeId: string;
        jobNumber: string;
        title: string;
        payAmount: import(".prisma/client/runtime/library").Decimal;
        jobType: import("@prisma/client").$Enums.JobType;
        dueDate: Date | null;
        completedAt: Date | null;
    }>;
    markAsComplete(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import("@prisma/client").$Enums.JobStatus;
        createdBy: string;
        employeeId: string;
        jobNumber: string;
        title: string;
        payAmount: import(".prisma/client/runtime/library").Decimal;
        jobType: import("@prisma/client").$Enums.JobType;
        dueDate: Date | null;
        completedAt: Date | null;
    }>;
    remove(id: string, user: any): Promise<void>;
}
//# sourceMappingURL=jobs.controller.d.ts.map