import { Injectable } from '@nestjs/common';
import { Prisma, Job, JobStatus } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class JobRepository extends BaseRepository<
  Job,
  Prisma.JobCreateInput,
  Prisma.JobUpdateInput,
  Prisma.JobFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'job');
  }

  async findByEmployee(employeeId: string, includePayments = false): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: includePayments ? {
          orderBy: { createdAt: 'desc' },
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: JobStatus, includeRelations = false): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { status },
      include: includeRelations ? {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: true,
      } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingJobs(): Promise<Job[]> {
    return this.findByStatus(JobStatus.PENDING, true);
  }

  async findReadyForPayment(): Promise<Job[]> {
    return this.findByStatus(JobStatus.READY, true);
  }

  async updateStatus(id: string, status: JobStatus, completedAt?: Date): Promise<Job> {
    const updateData: Prisma.JobUpdateInput = {
      status,
    };

    if (status === JobStatus.READY && completedAt) {
      updateData.completedAt = completedAt;
    }

    return this.update(id, updateData);
  }

  async getJobSummary(employeeId?: string) {
    const whereClause = employeeId ? { employeeId } : {};

    const [totalJobs, pendingJobs, readyJobs, paidJobs, payAmountAgg] = await Promise.all([
      this.prisma.job.count({ where: whereClause }),
      this.prisma.job.count({ where: { ...whereClause, status: JobStatus.PENDING } }),
      this.prisma.job.count({ where: { ...whereClause, status: JobStatus.READY } }),
      this.prisma.job.count({ where: { ...whereClause, status: JobStatus.PAID } }),
      this.prisma.job.aggregate({
        where: whereClause,
        _sum: { payAmount: true },
      }),
    ]);

    const pendingPayAmount = await this.prisma.job.aggregate({
      where: {
        ...whereClause,
        status: { in: [JobStatus.PENDING, JobStatus.READY, JobStatus.PARTIALLY_PAID] }
      },
      _sum: { payAmount: true },
    });

    return {
      totalJobs,
      pendingJobs,
      readyJobs,
      paidJobs,
      totalPayAmount: Number(payAmountAgg._sum.payAmount || 0),
      pendingPayAmount: Number(pendingPayAmount._sum.payAmount || 0),
    };
  }

  async findWithFilters(filters: {
    employeeId?: string;
    status?: JobStatus;
    jobType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Job[]> {
    const where: Prisma.JobWhereInput = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.jobType) {
      where.jobType = filters.jobType as any;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return this.prisma.job.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}