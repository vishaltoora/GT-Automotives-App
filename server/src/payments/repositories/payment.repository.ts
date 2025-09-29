import { Injectable } from '@nestjs/common';
import { Prisma, Payment, PaymentStatus, JobStatus } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class PaymentRepository extends BaseRepository<
  Payment,
  Prisma.PaymentCreateInput,
  Prisma.PaymentUpdateInput,
  Prisma.PaymentFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'payment');
  }

  async findByEmployee(employeeId: string, includeJob = false): Promise<Payment[]> {
    return this.prisma.payment.findMany({
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
        job: includeJob ? {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            status: true,
          },
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByJob(jobId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { jobId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: PaymentStatus, includeRelations = false): Promise<Payment[]> {
    return this.prisma.payment.findMany({
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
        job: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            status: true,
          },
        },
      } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingPayments(): Promise<Payment[]> {
    return this.findByStatus(PaymentStatus.PENDING, true);
  }

  async processPayment(id: string, paidBy: string): Promise<Payment> {
    // Start transaction to update both payment and job status
    return await this.prisma.$transaction(async (tx) => {
      // Update payment status
      const payment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          paidBy,
        },
        include: {
          job: true,
        },
      });

      // Check if job is fully paid
      const allJobPayments = await tx.payment.findMany({
        where: { jobId: payment.jobId },
      });

      const totalPaid = allJobPayments
        .filter(p => p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const jobPayAmount = Number(payment.job.payAmount);

      // Update job status based on payment completion
      let newJobStatus: JobStatus;
      if (totalPaid >= jobPayAmount) {
        newJobStatus = JobStatus.PAID;
      } else if (totalPaid > 0) {
        newJobStatus = JobStatus.PARTIALLY_PAID;
      } else {
        newJobStatus = payment.job.status; // Keep current status
      }

      await tx.job.update({
        where: { id: payment.jobId },
        data: { status: newJobStatus },
      });

      return payment;
    });
  }

  async getPaymentSummary(employeeId?: string) {
    const whereClause = employeeId ? { employeeId } : {};

    const [totalPayments, pendingPayments, paidPayments, paymentAmountAgg] = await Promise.all([
      this.prisma.payment.count({ where: whereClause }),
      this.prisma.payment.count({ where: { ...whereClause, status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { ...whereClause, status: PaymentStatus.PAID } }),
      this.prisma.payment.aggregate({
        where: whereClause,
        _sum: { amount: true },
      }),
    ]);

    const pendingAmount = await this.prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: PaymentStatus.PENDING,
      },
      _sum: { amount: true },
    });

    const paidAmount = await this.prisma.payment.aggregate({
      where: {
        ...whereClause,
        status: PaymentStatus.PAID,
      },
      _sum: { amount: true },
    });

    return {
      totalPayments,
      pendingPayments,
      paidPayments,
      totalAmount: Number(paymentAmountAgg._sum.amount || 0),
      pendingAmount: Number(pendingAmount._sum.amount || 0),
      paidAmount: Number(paidAmount._sum.amount || 0),
    };
  }

  async findWithFilters(filters: {
    employeeId?: string;
    status?: PaymentStatus;
    paymentMethod?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Payment[]> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod as any;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return this.prisma.payment.findMany({
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
        job: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayrollReport(startDate: Date, endDate: Date, employeeId?: string) {
    const whereClause: Prisma.PaymentWhereInput = {
      status: PaymentStatus.PAID,
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const payments = await this.prisma.payment.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            jobType: true,
          },
        },
      },
      orderBy: [
        { employee: { lastName: 'asc' } },
        { employee: { firstName: 'asc' } },
        { paidAt: 'desc' },
      ],
    });

    // Group by employee
    const payrollByEmployee = payments.reduce((acc, payment) => {
      const employeeKey = payment.employeeId;
      if (!acc[employeeKey]) {
        acc[employeeKey] = {
          employee: payment.employee,
          payments: [],
          totalAmount: 0,
        };
      }
      acc[employeeKey].payments.push(payment);
      acc[employeeKey].totalAmount += Number(payment.amount);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(payrollByEmployee);
  }
}