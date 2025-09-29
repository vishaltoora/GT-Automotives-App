import { JobRepository } from './repositories/job.repository';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobSummaryDto } from '../common/dto/job.dto';
import { Job, JobStatus, JobType } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
export declare class JobsService {
    private readonly jobRepository;
    private readonly auditRepository;
    constructor(jobRepository: JobRepository, auditRepository: AuditRepository);
    create(createJobDto: CreateJobDto, userId: string): Promise<Job>;
    findAll(filters?: {
        employeeId?: string;
        status?: JobStatus;
        jobType?: JobType;
        startDate?: string;
        endDate?: string;
    }): Promise<JobResponseDto[]>;
    findOne(id: string): Promise<JobResponseDto>;
    findByEmployee(employeeId: string): Promise<JobResponseDto[]>;
    findPendingJobs(): Promise<JobResponseDto[]>;
    findReadyForPayment(): Promise<JobResponseDto[]>;
    update(id: string, updateJobDto: UpdateJobDto, userId: string): Promise<Job>;
    markAsComplete(id: string, userId: string): Promise<Job>;
    remove(id: string, userId: string): Promise<void>;
    getJobSummary(employeeId?: string): Promise<JobSummaryDto>;
    private transformToResponseDto;
}
//# sourceMappingURL=jobs.service.d.ts.map