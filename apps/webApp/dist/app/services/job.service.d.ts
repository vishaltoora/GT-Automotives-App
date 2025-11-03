import { CreateJobDto, UpdateJobDto, JobResponseDto, JobSummaryDto, JobStatus, JobType } from '@gt-automotive/data';
export declare function setClerkTokenGetter(getter: () => Promise<string | null>): void;
declare class JobService {
    private baseUrl;
    private makeRequest;
    createJob(jobData: CreateJobDto): Promise<JobResponseDto>;
    getJobs(filters?: {
        employeeId?: string;
        status?: JobStatus;
        jobType?: JobType;
        startDate?: string;
        endDate?: string;
    }): Promise<JobResponseDto[]>;
    getJob(id: string): Promise<JobResponseDto>;
    updateJob(id: string, updates: UpdateJobDto): Promise<JobResponseDto>;
    deleteJob(id: string): Promise<void>;
    markJobComplete(id: string): Promise<JobResponseDto>;
    getJobsByEmployee(employeeId: string): Promise<JobResponseDto[]>;
    getMyJobs(): Promise<JobResponseDto[]>;
    getMyJobSummary(): Promise<JobSummaryDto>;
    getPendingJobs(): Promise<JobResponseDto[]>;
    getJobsReadyForPayment(): Promise<JobResponseDto[]>;
    getJobSummary(employeeId?: string): Promise<JobSummaryDto>;
}
export declare const jobService: JobService;
export default jobService;
//# sourceMappingURL=job.service.d.ts.map