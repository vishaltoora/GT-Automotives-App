import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JobRepository } from './repositories/job.repository';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobSummaryDto } from '../common/dto/job.dto';
import { Job, JobStatus, JobType } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly auditRepository: AuditRepository,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
    try {
      // Validate that the employee exists and has STAFF, ADMIN, or SUPERVISOR role
      const employee = await this.jobRepository['prisma'].user.findUnique({
        where: { id: createJobDto.employeeId },
        include: { role: true },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      if (employee.role.name !== 'STAFF' && employee.role.name !== 'ADMIN' && employee.role.name !== 'SUPERVISOR') {
        throw new BadRequestException('Jobs can only be assigned to staff, admin, or supervisor users');
      }

      const jobData = {
        employee: {
          connect: { id: createJobDto.employeeId }
        },
        title: createJobDto.title,
        description: createJobDto.description,
        payAmount: createJobDto.payAmount,
        jobType: createJobDto.jobType,
        dueDate: createJobDto.dueDate ? new Date(createJobDto.dueDate) : undefined,
        createdBy: userId,
      };

      const job = await this.jobRepository.create(jobData);

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'CREATE',
        resource: 'Job',
        resourceId: job.id,
        newValue: job,
      });

      return job;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create job');
    }
  }

  async findAll(filters?: {
    employeeId?: string;
    status?: JobStatus;
    jobType?: JobType;
    startDate?: string;
    endDate?: string;
  }): Promise<JobResponseDto[]> {
    const filterParams = {
      employeeId: filters?.employeeId,
      status: filters?.status,
      jobType: filters?.jobType,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    };

    const jobs = await this.jobRepository.findWithFilters(filterParams);
    return this.transformToResponseDto(jobs);
  }

  async findOne(id: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.transformToResponseDto([job])[0];
  }

  async findByEmployee(employeeId: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobRepository.findByEmployee(employeeId, true);
    return this.transformToResponseDto(jobs);
  }

  async findPendingJobs(): Promise<JobResponseDto[]> {
    const jobs = await this.jobRepository.findPendingJobs();
    return this.transformToResponseDto(jobs);
  }

  async findReadyForPayment(): Promise<JobResponseDto[]> {
    const jobs = await this.jobRepository.findReadyForPayment();
    return this.transformToResponseDto(jobs);
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string): Promise<Job> {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    try {
      const updateData: any = {};

      if (updateJobDto.title !== undefined) updateData.title = updateJobDto.title;
      if (updateJobDto.description !== undefined) updateData.description = updateJobDto.description;
      if (updateJobDto.payAmount !== undefined) updateData.payAmount = updateJobDto.payAmount;
      if (updateJobDto.status !== undefined) updateData.status = updateJobDto.status;
      if (updateJobDto.jobType !== undefined) updateData.jobType = updateJobDto.jobType;
      if (updateJobDto.dueDate !== undefined) updateData.dueDate = new Date(updateJobDto.dueDate);
      if (updateJobDto.completedAt !== undefined) updateData.completedAt = new Date(updateJobDto.completedAt);

      const updatedJob = await this.jobRepository.update(id, updateData);

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'UPDATE',
        resource: 'Job',
        resourceId: id,
        oldValue: existingJob,
        newValue: updatedJob,
      });

      return updatedJob;
    } catch (error) {
      throw new BadRequestException('Failed to update job');
    }
  }

  async markAsComplete(id: string, userId: string): Promise<Job> {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.status === JobStatus.PAID) {
      throw new BadRequestException('Cannot modify a paid job');
    }

    const updatedJob = await this.jobRepository.updateStatus(
      id,
      JobStatus.READY,
      new Date()
    );

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'UPDATE',
      resource: 'Job',
      resourceId: id,
      oldValue: existingJob,
      newValue: updatedJob,
    });

    return updatedJob;
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundException('Job not found');
    }

    if (existingJob.status === JobStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid job');
    }

    // Check if job has any payments
    // Note: Payment validation would need to be implemented in the repository layer
    // const jobWithPayments = await this.jobRepository.findById(id);
    // if (jobWithPayments?.payments && jobWithPayments.payments.length > 0) {
    //   throw new BadRequestException('Cannot delete job with existing payments');
    // }

    await this.jobRepository.delete(id);

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'DELETE',
      resource: 'Job',
      resourceId: id,
      oldValue: existingJob,
    });
  }

  async getJobSummary(employeeId?: string): Promise<JobSummaryDto> {
    return await this.jobRepository.getJobSummary(employeeId);
  }

  private transformToResponseDto(jobs: any[]): JobResponseDto[] {
    return jobs.map(job => ({
      id: job.id,
      jobNumber: job.jobNumber,
      employeeId: job.employeeId,
      title: job.title,
      description: job.description,
      payAmount: Number(job.payAmount),
      status: job.status,
      jobType: job.jobType,
      dueDate: job.dueDate,
      completedAt: job.completedAt,
      createdBy: job.createdBy,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      employee: job.employee ? {
        id: job.employee.id,
        firstName: job.employee.firstName,
        lastName: job.employee.lastName,
        email: job.employee.email,
      } : undefined,
      payments: job.payments ? job.payments.map((payment: any) => ({
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paidAt,
        paymentMethod: payment.paymentMethod,
      })) : undefined,
    }));
  }
}