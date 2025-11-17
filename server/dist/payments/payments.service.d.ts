import { PaymentRepository } from './repositories/payment.repository';
import { JobRepository } from '../jobs/repositories/job.repository';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, PaymentSummaryDto, ProcessPaymentDto } from '../common/dto/payment.dto';
import { Payment, PaymentStatus, PaymentMethod } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly jobRepository;
    private readonly auditRepository;
    constructor(paymentRepository: PaymentRepository, jobRepository: JobRepository, auditRepository: AuditRepository);
    create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment>;
    processPayment(processPaymentDto: ProcessPaymentDto, userId: string): Promise<Payment>;
    findAll(filters?: {
        employeeId?: string;
        status?: PaymentStatus;
        paymentMethod?: PaymentMethod;
        startDate?: string;
        endDate?: string;
    }): Promise<PaymentResponseDto[]>;
    findOne(id: string): Promise<PaymentResponseDto>;
    findByEmployee(employeeId: string): Promise<PaymentResponseDto[]>;
    findByJob(jobId: string): Promise<PaymentResponseDto[]>;
    findPendingPayments(): Promise<PaymentResponseDto[]>;
    update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string): Promise<Payment>;
    revertPaymentStatus(id: string, userId: string): Promise<Payment>;
    remove(id: string, userId: string): Promise<void>;
    getPaymentSummary(employeeId?: string): Promise<PaymentSummaryDto>;
    getPayrollReport(startDate: string, endDate: string, employeeId?: string): Promise<any[]>;
    /**
     * Get payments processed on a specific date (for EOD summary)
     * Uses business timezone (PST/PDT) to ensure correct day matching
     * @param paymentDate - Date in YYYY-MM-DD format (e.g., "2025-11-13")
     */
    getByPaymentDate(paymentDate: string): Promise<PaymentResponseDto[]>;
    private transformToResponseDto;
}
//# sourceMappingURL=payments.service.d.ts.map