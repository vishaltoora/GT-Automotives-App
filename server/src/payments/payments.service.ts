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
        paidAt: new Date()
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