import { Prisma, Job, JobStatus } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';
export declare class JobRepository extends BaseRepository<Job, Prisma.JobCreateInput, Prisma.JobUpdateInput, Prisma.JobFindManyArgs> {
    constructor(prisma: PrismaService);
    findByEmployee(employeeId: string, includePayments?: boolean): Promise<Job[]>;
    findByStatus(status: JobStatus, includeRelations?: boolean): Promise<Job[]>;
    findPendingJobs(): Promise<Job[]>;
    findReadyForPayment(): Promise<Job[]>;
    updateStatus(id: string, status: JobStatus, completedAt?: Date): Promise<Job>;
    getJobSummary(employeeId?: string): Promise<{
        totalJobs: number;
        pendingJobs: number;
        readyJobs: number;
        paidJobs: number;
        totalPayAmount: number;
        pendingPayAmount: number;
    }>;
    findWithFilters(filters: {
        employeeId?: string;
        status?: JobStatus;
        jobType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Job[]>;
}
//# sourceMappingURL=job.repository.d.ts.map