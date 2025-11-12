import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { JobRepository } from '../jobs/repositories/job.repository';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
  PaymentSummaryDto,
  ProcessPaymentDto
} from '../common/dto/payment.dto';
import { Payment, PaymentStatus, PaymentMethod, JobStatus } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly jobRepository: JobRepository,
    private readonly auditRepository: AuditRepository,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    try {
      // Validate that the job exists and is in correct status
      const job = await this.jobRepository.findById(createPaymentDto.jobId);

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.status === JobStatus.CANCELLED) {
        throw new BadRequestException('Cannot create payment for cancelled job');
      }

      // Validate employee matches
      if (job.employeeId !== createPaymentDto.employeeId) {
        throw new BadRequestException('Employee ID does not match the job');
      }

      // Check if payment amount would exceed job amount
      // Note: Payment validation would need additional repository methods
      const totalExistingPayments = 0; // Placeholder - needs implementation

      const newTotal = totalExistingPayments + createPaymentDto.amount;
      if (newTotal > Number(job.payAmount)) {
        throw new BadRequestException(
          `Payment amount would exceed job amount. Remaining: $${Number(job.payAmount) - totalExistingPayments}`
        );
      }

      const paymentData = {
        job: {
          connect: { id: createPaymentDto.jobId }
        },
        employee: {
          connect: { id: createPaymentDto.employeeId }
        },
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        notes: createPaymentDto.notes,
        reference: createPaymentDto.reference,
        paidBy: createPaymentDto.paidBy,
        status: PaymentStatus.PENDING
      };

      const payment = await this.paymentRepository.create(paymentData);

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'CREATE',
        resource: 'Payment',
        resourceId: payment.id,
        newValue: payment,
      });

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create payment');
    }
  }

  async processPayment(processPaymentDto: ProcessPaymentDto, userId: string): Promise<Payment> {
    try {
      // Import timezone helper for business timezone awareness
      const { getCurrentBusinessDateTime } = await import('../config/timezone.config.js');

      // Find the job and validate
      const job = await this.jobRepository.findById(processPaymentDto.jobId);

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.status !== JobStatus.READY) {
        throw new BadRequestException(`Job must be in READY status to process payment. Current status: ${job.status}. Please mark the job as completed first.`);
      }

      // Determine payment amount (use full job amount if not specified)
      const paymentAmount = processPaymentDto.amount || Number(job.payAmount);

      // Check for existing payments
      // Note: Payment validation would need additional repository methods
      const totalExistingPayments = 0; // Placeholder - needs implementation

      if (totalExistingPayments + paymentAmount > Number(job.payAmount)) {
        throw new BadRequestException(
          `Payment amount would exceed job amount. Remaining: $${Number(job.payAmount) - totalExistingPayments}`
        );
      }

      // Create and immediately process the payment
      // Use business timezone (PST/PDT) for paidAt timestamp to ensure correct day matching in EOD summaries
      const paymentData = {
        job: {
          connect: { id: processPaymentDto.jobId }
        },
        employee: {
          connect: { id: job.employeeId }
        },
        amount: paymentAmount,
        paymentMethod: processPaymentDto.paymentMethod,
        notes: processPaymentDto.notes,
        reference: processPaymentDto.reference,
        paidBy: processPaymentDto.paidBy,
        status: PaymentStatus.PAID,
        paidAt: getCurrentBusinessDateTime() // Use PST/PDT timezone, not UTC
      };

      const payment = await this.paymentRepository.create(paymentData);

      // Update job status
      const newTotalPaid = totalExistingPayments + paymentAmount;
      const newJobStatus = newTotalPaid >= Number(job.payAmount) ? JobStatus.PAID : JobStatus.PARTIALLY_PAID;

      await this.jobRepository.updateStatus(processPaymentDto.jobId, newJobStatus);

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'PROCESS_PAYMENT',
        resource: 'Payment',
        resourceId: payment.id,
        newValue: payment,
      });

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process payment');
    }
  }

  async findAll(filters?: {
    employeeId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentResponseDto[]> {
    const filterParams = {
      employeeId: filters?.employeeId,
      status: filters?.status,
      paymentMethod: filters?.paymentMethod,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    };

    const payments = await this.paymentRepository.findWithFilters(filterParams);
    return this.transformToResponseDto(payments);
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.transformToResponseDto([payment])[0];
  }

  async findByEmployee(employeeId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByEmployee(employeeId, true);
    return this.transformToResponseDto(payments);
  }

  async findByJob(jobId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByJob(jobId);
    return this.transformToResponseDto(payments);
  }

  async findPendingPayments(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findPendingPayments();
    return this.transformToResponseDto(payments);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    if (existingPayment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot modify a paid payment');
    }

    try {
      const updateData: any = {};

      if (updatePaymentDto.amount !== undefined) updateData.amount = updatePaymentDto.amount;
      if (updatePaymentDto.paymentMethod !== undefined) updateData.paymentMethod = updatePaymentDto.paymentMethod;
      if (updatePaymentDto.status !== undefined) updateData.status = updatePaymentDto.status;
      // paidAt is already in the format received from client, no need to convert timezone here
      if (updatePaymentDto.paidAt !== undefined) updateData.paidAt = new Date(updatePaymentDto.paidAt);
      if (updatePaymentDto.notes !== undefined) updateData.notes = updatePaymentDto.notes;
      if (updatePaymentDto.reference !== undefined) updateData.reference = updatePaymentDto.reference;
      if (updatePaymentDto.paidBy !== undefined) updateData.paidBy = updatePaymentDto.paidBy;

      const updatedPayment = await this.paymentRepository.update(id, updateData);

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'UPDATE',
        resource: 'Payment',
        resourceId: id,
        oldValue: existingPayment,
        newValue: updatedPayment,
      });

      return updatedPayment;
    } catch (error) {
      throw new BadRequestException('Failed to update payment');
    }
  }

  async revertPaymentStatus(id: string, userId: string): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    if (existingPayment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Can only revert PAID payments');
    }

    try {
      // Revert payment status to PENDING and clear paidAt
      const updatedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.PENDING,
        paidAt: null,
      });

      // Also need to update the related job status back to READY
      if (existingPayment.jobId) {
        await this.jobRepository.updateStatus(existingPayment.jobId, JobStatus.READY);
      }

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'REVERT_PAYMENT_STATUS',
        resource: 'Payment',
        resourceId: id,
        oldValue: existingPayment,
        newValue: updatedPayment,
      });

      return updatedPayment;
    } catch (error) {
      throw new BadRequestException('Failed to revert payment status');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    if (existingPayment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid payment');
    }

    await this.paymentRepository.delete(id);

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'DELETE',
      resource: 'Payment',
      resourceId: id,
      oldValue: existingPayment,
    });
  }

  async getPaymentSummary(employeeId?: string): Promise<PaymentSummaryDto> {
    return await this.paymentRepository.getPaymentSummary(employeeId);
  }

  async getPayrollReport(startDate: string, endDate: string, employeeId?: string) {
    return await this.paymentRepository.getPayrollReport(
      new Date(startDate),
      new Date(endDate),
      employeeId
    );
  }

  /**
   * Get payments processed on a specific date (for EOD summary)
   * Uses business timezone (PST/PDT) to ensure correct day matching
   */
  async getByPaymentDate(paymentDate: Date) {
    const { extractBusinessDate, POSTGRES_TIMEZONE } = await import('../config/timezone.config.js');

    // Extract date in business timezone (PST/PDT)
    const dateOnly = extractBusinessDate(paymentDate);

    console.log('[GET PAYMENTS BY DATE] Query:', {
      input: paymentDate,
      dateOnly,
      businessTimezone: POSTGRES_TIMEZONE,
    });

    // Use raw SQL with AT TIME ZONE to compare dates in Pacific Time
    const payments = await this.paymentRepository['prisma'].$queryRaw<any[]>`
      SELECT
        p.*,
        json_build_object(
          'id', j.id,
          'jobNumber', j."jobNumber",
          'title', j.title,
          'status', j.status
        ) as job,
        json_build_object(
          'id', u.id,
          'firstName', u."firstName",
          'lastName', u."lastName",
          'email', u.email
        ) as employee
      FROM "Payment" p
      LEFT JOIN "Job" j ON j.id = p."jobId"
      LEFT JOIN "User" u ON u.id = p."employeeId"
      WHERE p.status = 'PAID'
        AND DATE(p."paidAt" AT TIME ZONE 'UTC' AT TIME ZONE ${POSTGRES_TIMEZONE}) = ${dateOnly}::date
      ORDER BY p."paidAt" DESC
    `;

    console.log(`[GET PAYMENTS BY DATE] Found ${(payments as any[]).length} payments for ${dateOnly}`);

    return this.transformToResponseDto(payments as any[]);
  }

  private transformToResponseDto(payments: any[]): PaymentResponseDto[] {
    return payments.map(payment => ({
      id: payment.id,
      jobId: payment.jobId,
      employeeId: payment.employeeId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paidAt: payment.paidAt,
      paidBy: payment.paidBy,
      notes: payment.notes,
      reference: payment.reference,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      job: payment.job ? {
        id: payment.job.id,
        jobNumber: payment.job.jobNumber,
        title: payment.job.title,
        status: payment.job.status,
      } : undefined,
      employee: payment.employee ? {
        id: payment.employee.id,
        firstName: payment.employee.firstName,
        lastName: payment.employee.lastName,
        email: payment.employee.email,
      } : undefined,
    }));
  }
}